const Stripe = require('stripe');
const { prisma } = require('../../config/database');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  buildChunkedMetadata(keyPrefix, payload, maxValueLength = 500) {
    const serializedPayload = JSON.stringify(payload);
    const chunks = [];

    for (let i = 0; i < serializedPayload.length; i += maxValueLength) {
      chunks.push(serializedPayload.slice(i, i + maxValueLength));
    }

    // Stripe metadata supports up to 50 keys. Reserve 2 keys for marker and count.
    if (chunks.length > 48) {
      throw new Error(
        'Registration payload is too large to store in Stripe metadata.',
      );
    }

    const metadata = {
      isPaidRegistration: 'true',
      [`${keyPrefix}Parts`]: String(chunks.length),
    };

    chunks.forEach((chunk, index) => {
      metadata[`${keyPrefix}_${index + 1}`] = chunk;
    });

    return metadata;
  }

  parseChunkedMetadata(metadata, keyPrefix) {
    const totalParts = Number(metadata?.[`${keyPrefix}Parts`] || 0);
    if (!totalParts) return null;

    const serializedPayload = Array.from({ length: totalParts }, (_, index) => {
      const key = `${keyPrefix}_${index + 1}`;
      return metadata?.[key] || '';
    }).join('');

    if (!serializedPayload) return null;
    return JSON.parse(serializedPayload);
  }

  mapStripeSubscriptionStatus(stripeStatus) {
    if (stripeStatus === 'canceled') return 'CANCELED';
    if (stripeStatus === 'unpaid' || stripeStatus === 'incomplete_expired') {
      return 'EXPIRED';
    }
    return 'ACTIVE';
  }

  async createRegistrationCheckoutSession({
    subscriptionPlan,
    vendorData,
    imageUrls,
    hashedPassword,
  }) {
    const { name, email } = vendorData;

    const registrationPayload = {
      ...vendorData,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      imageUrls: imageUrls || [],
      packages: vendorData.packages || [],
      highlightedServices: vendorData.highlightedServices || [],
    };

    const metadata = this.buildChunkedMetadata(
      'registrationPayload',
      registrationPayload,
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email.toLowerCase(),
      // line_items: [
      //   {
      //     price: subscriptionPlan.stripePriceId,
      //     quantity: 1,
      //   },
      // ],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Subscribe to Professional Vendor Plan',
            },
            unit_amount: Number(subscriptionPlan.priceMonthly) * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],

      metadata,
      success_url: `${process.env.FRONTEND_URL}/registration-success?email=${email}&planName=${subscriptionPlan.planName}${subscriptionPlan.priceMonthly ? `&planPrice=${subscriptionPlan.priceMonthly}` : ''}&userName=${encodeURIComponent(name)}`,
      cancel_url: `${process.env.FRONTEND_URL}/registration-cancel?canceled=true`,
    });

    return {
      requiresPayment: true,
      url: session.url,
    };
  }

  async handleSuccessfulRegistrationPayment(session) {
    const meta = session.metadata;

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(startsAt.getDate() + 30);

    const chunkedRegistrationPayload = this.parseChunkedMetadata(
      meta,
      'registrationPayload',
    );

    const registrationData = chunkedRegistrationPayload || {
      name: meta.name,
      email: meta.email,
      passwordHash: meta.passwordHash,
      businessName: meta.businessName,
      location: meta.location,
      experienceYears: meta.experienceYears,
      speciality: meta.speciality,
      aboutMe: meta.aboutMe,
      categoryId: meta.categoryId,
      phone: meta.phone || '',
      highlightedServices: JSON.parse(meta.highlightedServices || '[]'),
      imageUrls: JSON.parse(meta.imageUrls || '[]'),
      packages: JSON.parse(meta.packages || '[]'),
      packageId: meta.packageId,
      cityId: meta.cityId,
      stateId: meta.stateId,
    };

    const paymentReferenceId = session.payment_intent || session.id;

    if (paymentReferenceId) {
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeIntentId: paymentReferenceId },
      });

      if (existingPayment) {
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email: registrationData.email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            name: registrationData.name,
            email: registrationData.email,
            passwordHash: registrationData.passwordHash,
            role: 'VENDOR',
            status: 'ACTIVE',
            isActive: true,
            emailVerified: true,
          },
        });
      }

      let vendorProfile = await tx.vendorProfile.findUnique({
        where: { userId: user.id },
      });

      if (!vendorProfile) {
        vendorProfile = await tx.vendorProfile.create({
          data: {
            userId: user.id,
            businessName: registrationData.businessName,
            location: registrationData.location,
            experienceYears: registrationData.experienceYears,
            speciality: registrationData.speciality,
            aboutMe: registrationData.aboutMe,
            categoryId: registrationData.categoryId,
            phone: registrationData.phone,
            stripeCustomerId: session.customer,
            highlightedServices: registrationData.highlightedServices,
            cityId: registrationData.cityId,
            stateId: registrationData.stateId,
            portfolioImages: {
              create: registrationData.imageUrls.map((url, index) => ({
                mediaUrl: url,
                sortOrder: index,
              })),
            },
            packages: {
              create: registrationData.packages.map((pkg) => ({
                packageName: pkg.packageName,
                price: pkg.price,
                badge: pkg.badge || null,
                features: pkg.features || [],
              })),
            },
          },
        });
      }

      let subscription = null;
      if (session.subscription) {
        subscription = await tx.vendorSubscription.findUnique({
          where: { stripeSubscriptionId: session.subscription },
        });
      }

      if (!subscription) {
        subscription = await tx.vendorSubscription.create({
          data: {
            vendorId: vendorProfile.id,
            planId: registrationData.packageId,
            status: 'ACTIVE',
            stripeSubscriptionId: session.subscription,
            startsAt,
            endsAt,
          },
        });
      }

      await tx.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: {
          currentSubscriptionId: subscription.id,
          stripeCustomerId: session.customer,
        },
      });

      await tx.payment.create({
        data: {
          vendorId: vendorProfile.id,
          subscriptionId: subscription.id,
          amount: (session.amount_total || 0) / 100,
          status: 'SUCCESS',
          stripeIntentId: paymentReferenceId,
          purchaseDate: new Date(),
        },
      });
    });
  }

  async createSubscriptionUpdateSession({
    vendorId,
    currentSubscription,
    newPlan,
  }) {
    console.log(
      'Creating subscription update session for vendorId:',
      currentSubscription,
    );

    let stripeCustomerId = currentSubscription?.vendor?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: currentSubscription.vendor.email,
        name: currentSubscription.vendor.name,
        metadata: {
          vendorId: vendorId,
        },
      });

      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Subscribe to Professional Vendor Plan',
            },
            unit_amount: Number(newPlan.priceMonthly) * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],

      metadata: {
        isPlanUpdate: 'true',
        vendorId: vendorId,
        oldSubscriptionId: currentSubscription.id,
        newPlanId: newPlan.id,
      },
      success_url: `${process.env.FRONTEND_URL}/vendor/dashboard/payment-success?updated=true&planName=${newPlan.planName}&planPrice=${newPlan.priceMonthly}`,
      cancel_url: `${process.env.FRONTEND_URL}/vendor/dashboard/payment-canceled`,
    });

    return {
      requiresPayment: true,
      url: session.url,
    };
  }

  async handleSuccessfulPlanUpdate(session) {
    const meta = session.metadata;
    const stripeSubscriptionId = session.subscription;
    const stripeInvoiceId = session.invoice;

    // In subscription mode, payment_intent might be null. Fallback to invoice ID to prevent unique constraint crash.
    const targetIntentId =
      session.payment_intent || stripeInvoiceId || session.id;

    // 1. Prevent duplicate processing (Fixes Prisma P2002 Unique Constraint Error)
    if (targetIntentId) {
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeIntentId: targetIntentId },
      });

      // If payment already exists, acknowledge and exit early to prevent duplication
      if (existingPayment) {
        console.log(
          `[Webhook] Payment ${targetIntentId} already processed. Skipping to avoid duplication.`,
        );
        return;
      }
    }

    // 2. Extract precise subscription period dates provided by Stripe (converted from seconds to milliseconds)
    const startsAt = session.current_period_start
      ? new Date(session.current_period_start * 1000)
      : new Date();

    const endsAt = session.current_period_end
      ? new Date(session.current_period_end * 1000)
      : new Date();

    // Fallback to default 30 days if Stripe period end timestamp is not present
    if (!session.current_period_end) {
      endsAt.setDate(startsAt.getDate() + 30);
    }

    // 3. Execute database operations inside a Prisma Transaction
    await prisma.$transaction(async (tx) => {
      // A. Expire the old subscription only if it exists (handles new vendors with no previous plan)
      if (meta.oldSubscriptionId) {
        await tx.vendorSubscription.update({
          where: { id: meta.oldSubscriptionId },
          data: { status: 'EXPIRED' },
        });
      }

      // B. Create the new subscription record
      const newSubscription = await tx.vendorSubscription.create({
        data: {
          vendorId: meta.vendorId,
          planId: meta.newPlanId,
          status: 'ACTIVE',
          stripeSubscriptionId: stripeSubscriptionId,
          startsAt,
          endsAt,
        },
      });

      // C. Update Vendor Profile with the new active subscription ID and sync stripeCustomerId
      await tx.vendorProfile.update({
        where: { id: meta.vendorId },
        data: {
          currentSubscriptionId: newSubscription.id,
          stripeCustomerId: session.customer, // Save or sync the customer ID
        },
      });

      await tx.payment.create({
        data: {
          vendorId: meta.vendorId,
          subscriptionId: newSubscription.id,
          amount: (session.amount_total || 0) / 100,
          status: 'SUCCESS',
          stripeIntentId: targetIntentId,
          purchaseDate: new Date(),
        },
      });
    });
  }

  async handleSubscriptionRenewal(invoice) {
    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    const vendorSubscription = await prisma.vendorSubscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!vendorSubscription) {
      console.warn(
        `[Webhook] Subscription not found for renewal: ${stripeSubscriptionId}`,
      );
      return;
    }

    const periodStart =
      invoice.lines?.data?.[0]?.period?.start || invoice.period_start;
    const periodEnd =
      invoice.lines?.data?.[0]?.period?.end || invoice.period_end;

    const startsAt = periodStart
      ? new Date(periodStart * 1000)
      : vendorSubscription.startsAt;
    const endsAt = periodEnd
      ? new Date(periodEnd * 1000)
      : (() => {
          const next = new Date(vendorSubscription.endsAt);
          next.setDate(next.getDate() + 30);
          return next;
        })();

    const paymentReference =
      invoice.payment_intent || invoice.charge || invoice.id;

    if (paymentReference) {
      const existingPayment = await prisma.payment.findUnique({
        where: { stripeIntentId: paymentReference },
      });

      if (existingPayment) {
        return;
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.vendorSubscription.update({
        where: { id: vendorSubscription.id },
        data: {
          status: 'ACTIVE',
          startsAt,
          endsAt,
        },
      });

      await tx.payment.create({
        data: {
          vendorId: vendorSubscription.vendorId,
          subscriptionId: vendorSubscription.id,
          amount: (invoice.amount_paid || invoice.amount_due || 0) / 100,
          currency: (invoice.currency || 'usd').toUpperCase(),
          status: 'SUCCESS',
          stripeIntentId: paymentReference,
          purchaseDate: new Date(),
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorSubscription.vendorId },
        data: { currentSubscriptionId: vendorSubscription.id },
      });
    });
  }

  async handleSubscriptionUpdate(subscription) {
    const stripeSubscriptionId = subscription.id;
    if (!stripeSubscriptionId) return;

    const vendorSubscription = await prisma.vendorSubscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!vendorSubscription) {
      console.warn(
        `[Webhook] Subscription not found for update: ${stripeSubscriptionId}`,
      );
      return;
    }

    const startsAt = subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000)
      : vendorSubscription.startsAt;
    const endsAt = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : vendorSubscription.endsAt;

    const mappedStatus = this.mapStripeSubscriptionStatus(subscription.status);

    await prisma.$transaction(async (tx) => {
      const updatedSubscription = await tx.vendorSubscription.update({
        where: { id: vendorSubscription.id },
        data: {
          status: mappedStatus,
          startsAt,
          endsAt,
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorSubscription.vendorId },
        data: {
          currentSubscriptionId:
            mappedStatus === 'ACTIVE' ? updatedSubscription.id : null,
        },
      });
    });
  }

  async handleSubscriptionCancellation(subscription) {
    const stripeSubscriptionId = subscription.id;
    if (!stripeSubscriptionId) return;

    const vendorSubscription = await prisma.vendorSubscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!vendorSubscription) {
      console.warn(
        `[Webhook] Subscription not found for cancellation: ${stripeSubscriptionId}`,
      );
      return;
    }

    const endsAt = subscription.ended_at
      ? new Date(subscription.ended_at * 1000)
      : new Date();

    await prisma.$transaction(async (tx) => {
      await tx.vendorSubscription.update({
        where: { id: vendorSubscription.id },
        data: {
          status: 'CANCELED',
          endsAt,
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorSubscription.vendorId },
        data: { currentSubscriptionId: null },
      });
    });
  }

  async handleUpcomingInvoice(invoicePayload) {
    const stripeSubscriptionId = invoicePayload.subscription;

    if (!stripeSubscriptionId) {
      console.warn(
        '[Webhook] Upcoming invoice event received without subscription id',
      );
      return;
    }

    const userSubscription = await prisma.vendorSubscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscriptionId },
      include: { plan: true },
    });

    if (!userSubscription) {
      console.warn(
        `[Webhook] No subscription found in DB for upcoming invoice of sub: ${stripeSubscriptionId}`,
      );
      return;
    }

    const currentDbPriceInCents = Math.round(
      Number(userSubscription.plan.priceMonthly) * 100,
    );

    if (invoicePayload.amount_due !== currentDbPriceInCents) {
      try {
        const stripeSub =
          await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const subscriptionItemId = stripeSub.items.data[0].id;
        await prisma.$transaction(async (tx) => {
          await stripe.subscriptions.update(stripeSubscriptionId, {
            items: [
              {
                id: subscriptionItemId,
                price_data: {
                  currency: 'usd',
                  product: stripeSub.plan.product,
                  unit_amount: currentDbPriceInCents,
                  recurring: {
                    interval: 'month',
                  },
                },
              },
            ],
            proration_behavior: 'none',
          });
        });

        console.log(
          `[Webhook] Successfully updated upcoming price to €${userSubscription.plan.priceMonthly} for sub: ${stripeSubscriptionId}`,
        );
      } catch (error) {
        console.error(
          `[Webhook] Failed to update upcoming invoice for sub ${stripeSubscriptionId}:`,
          error.message,
        );
      }
    } else {
      console.log(
        `[Webhook] Price is already up-to-date (€${userSubscription.plan.priceMonthly}) for sub: ${stripeSubscriptionId}`,
      );
    }
  }
}

module.exports = PaymentService;
