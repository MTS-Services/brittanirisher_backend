const Stripe = require('stripe');
const { prisma } = require('../../config/database');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createRegistrationCheckoutSession({
    subscriptionPlan,
    vendorData,
    imageUrls,
    hashedPassword,
  }) {
    const {
      name,
      email,
      location,
      businessName,
      experienceYears,
      highlightedServices,
      speciality,
      aboutMe,
      packages,
      packageId,
      categoryId,
      phone,
    } = vendorData;

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
            unit_amount: subscriptionPlan.priceMonthly * 100,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],

      metadata: {
        isPaidRegistration: 'true',
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        businessName,
        location,
        experienceYears,
        speciality,
        aboutMe,
        categoryId,
        phone: phone || '',
        highlightedServices: JSON.stringify(highlightedServices || []),
        imageUrls: JSON.stringify(imageUrls || []),
        packages: JSON.stringify(packages || []),
        packageId: packageId,
      },
      success_url: `${process.env.FRONTEND_URL}/registration-success?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
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

    const highlightedServices = JSON.parse(meta.highlightedServices);
    const imageUrls = JSON.parse(meta.imageUrls);
    const packages = JSON.parse(meta.packages);

    const userExists = await prisma.user.findUnique({
      where: { email: meta.email },
    });
    if (userExists) return;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: meta.name,
          email: meta.email,
          passwordHash: meta.passwordHash,
          role: 'VENDOR',
          status: 'ACTIVE',
          isActive: true,
          emailVerified: true,
        },
      });

      const vendorProfile = await tx.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: meta.businessName,
          location: meta.location,
          experienceYears: meta.experienceYears,
          speciality: meta.speciality,
          aboutMe: meta.aboutMe,
          categoryId: meta.categoryId,
          phone: meta.phone,
          // stripeCustomerId: session.customer,
          highlightedServices,
          portfolioImages: {
            create: imageUrls.map((url, index) => ({
              mediaUrl: url,
              sortOrder: index,
            })),
          },
          packages: {
            create: packages.map((pkg) => ({
              packageName: pkg.packageName,
              price: pkg.price,
              badge: pkg.badge || null,
              features: pkg.features || [],
            })),
          },
        },
      });

      const subscription = await tx.vendorSubscription.create({
        data: {
          vendorId: vendorProfile.id,
          planId: meta.packageId,
          status: 'ACTIVE',
          stripeSubscriptionId: session.subscription,
          startsAt,
          endsAt,
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: { currentSubscriptionId: subscription.id },
      });

      await tx.payment.create({
        data: {
          vendorId: vendorProfile.id,
          subscriptionId: subscription.id,
          amount: (session.amount_total || 0) / 100,
          status: 'SUCCESS',
          stripeIntentId: session.payment_intent || '',
          purchaseDate: new Date(),
        },
      });
    });
  }
}

module.exports = PaymentService;
