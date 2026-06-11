const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const bcrypt = require('bcryptjs');
const { generateTokenPair } = require('../../utils/jwt');
const PaymentService = require('../payment/payment.services');

function calculateLocationMatchScore(loc1, loc2) {
  if (!loc1 || !loc2) return 0;
  const words1 = loc1
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const words2 = loc2
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words1.length === 0 || words2.length === 0) return 0;
  let matchCount = 0;
  words1.forEach((word) => {
    if (words2.includes(word)) {
      matchCount++;
    }
  });

  const maxWords = Math.max(words1.length, words2.length);
  return matchCount / maxWords;
}

class VendorProfileService {
  // async createVendorProfile(imageUrls, data) {
  //   const {
  //     name,
  //     email,
  //     location,
  //     businessName,
  //     experienceYears,
  //     highlightedServices,
  //     speciality,
  //     aboutMe,
  //     password,
  //     packages,
  //     packageId,
  //     categoryId,
  //   } = data;

  //   const existingUser = await prisma.user.findUnique({
  //     where: { email: email.toLowerCase() },
  //   });

  //   if (existingUser) {
  //     throw new AppError('Email already in use', 400);
  //   }

  //   if (!packageId) {
  //     throw new AppError('packageId is required', 400);
  //   }

  //   const [category, subscriptionPlan] = await Promise.all([
  //     prisma.category.findUnique({ where: { id: categoryId } }),
  //     prisma.subscriptionPlan.findUnique({ where: { id: packageId } }),
  //   ]);

  //   if (!category) {
  //     throw new AppError('Category not found', 404);
  //   }

  //   if (!subscriptionPlan) {
  //     throw new AppError('Subscription plan not found', 404);
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const startsAt = new Date();
  //   const endsAt = new Date();
  //   endsAt.setDate(startsAt.getDate() + 30);

  //   const result = await prisma.$transaction(async (tx) => {
  //     const user = await tx.user.create({
  //       data: {
  //         name,
  //         email: email.toLowerCase(),
  //         passwordHash: hashedPassword,
  //         role: 'VENDOR',
  //         status: 'ACTIVE',
  //         isActive: true,
  //         emailVerified: true,
  //       },
  //     });

  //     const vendorProfile = await tx.vendorProfile.create({
  //       data: {
  //         userId: user.id,
  //         businessName,
  //         location,
  //         experienceYears,
  //         speciality,
  //         aboutMe,
  //         categoryId,
  //         phone: data.phone,
  //         highlightedServices,
  //         portfolioImages: {
  //           create: imageUrls.map((url, index) => ({
  //             mediaUrl: url,
  //             sortOrder: index,
  //           })),
  //         },
  //         packages: {
  //           create: (packages || []).map((pkg) => ({
  //             packageName: pkg.packageName,
  //             price: pkg.price,
  //             badge: pkg.badge || null,
  //             features: pkg.features || [],
  //           })),
  //         },
  //       },
  //     });

  //     const subscription = await tx.vendorSubscription.create({
  //       data: {
  //         vendorId: vendorProfile.id,
  //         planId: packageId,
  //         status: 'ACTIVE',
  //         startsAt,
  //         endsAt,
  //       },
  //     });

  //     const tokens = generateTokenPair(user);
  //     await tx.session.create({
  //       data: {
  //         userId: user.id,
  //         refreshToken: tokens.refreshToken,
  //         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //       },
  //     });

  //     return {
  //       user: {
  //         id: user.id,
  //         name: user.name,
  //         email: user.email,
  //         role: user.role,
  //         status: user.status,
  //         emailVerified: user.emailVerified,
  //         joinedAt: user.joinedAt,
  //       },
  //       accessToken: tokens.accessToken,
  //       refreshToken: tokens.refreshToken,
  //     };
  //   });

  //   return result;
  // }

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createVendorProfile(imageUrls, data) {
    const {
      name,
      email,
      location,
      businessName,
      experienceYears,
      highlightedServices,
      speciality,
      aboutMe,
      password,
      packages,
      packageId,
      categoryId,
      cityId,
      stateId,
    } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    if (!packageId) {
      throw new AppError('packageId is required', 400);
    }

    const [category, subscriptionPlan] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.subscriptionPlan.findUnique({ where: { id: packageId } }),
    ]);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (!subscriptionPlan) {
      throw new AppError('Subscription plan not found', 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (subscriptionPlan.priceMonthly > 0) {
      // if (!subscriptionPlan.stripePriceId) {
      //   throw new AppError('Stripe Price ID missing for this paid plan', 500);
      // }

      return await this.paymentService.createRegistrationCheckoutSession({
        subscriptionPlan,
        vendorData: data,
        imageUrls,
        hashedPassword,
      });
    }

    if (subscriptionPlan.portfolioLimit !== -1) {
      if (imageUrls.length > subscriptionPlan.portfolioLimit) {
        imageUrls = imageUrls.slice(0, subscriptionPlan.portfolioLimit);
      }
    }

    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(startsAt.getDate() + 30);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          role: 'VENDOR',
          status: 'ACTIVE',
          isActive: true,
          emailVerified: true,
        },
      });

      const vendorProfile = await tx.vendorProfile.create({
        data: {
          userId: user.id,
          businessName,
          location,
          experienceYears,
          speciality,
          aboutMe,
          categoryId,
          cityId,
          stateId,
          phone: data.phone,
          highlightedServices,
          portfolioImages: {
            create: imageUrls.map((url, index) => ({
              mediaUrl: url,
              sortOrder: index,
            })),
          },
          packages: {
            create: (packages || []).map((pkg) => ({
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
          planId: packageId,
          status: 'ACTIVE',
          startsAt,
          endsAt,
        },
      });

      await tx.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: { currentSubscriptionId: subscription.id },
      });

      const tokens = generateTokenPair(user);
      await tx.session.create({
        data: {
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        requiresPayment: false,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    });

    return result;
  }

  async getVendorProfiles(filterDTO) {
    const {
      sortBy,
      sortOrder,
      search,
      limit,
      locationSearch,
      category,
      availableDate,
      minPrice,
      city,
      state,
      maxPrice,
      status = 'APPROVED',
    } = filterDTO;

    const offset = filterDTO.getOffset();
    const whereCondition = [];

    // 1. Filter: Text search (Matches Business Name or Speciality)
    if (search) {
      whereCondition.push({
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { speciality: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // 2. Filter: Location strict search
    if (locationSearch) {
      whereCondition.push({
        OR: [{ location: { contains: locationSearch, mode: 'insensitive' } }],
      });
    }

    // 3. Filter: Service Category
    if (category) {
      whereCondition.push({ category: { slug: category } });
    }

    if (city) {
      whereCondition.push({ city: { slug: city } });
    }

    if (state) {
      whereCondition.push({ state: { slug: state } });
    }

    // 4. Filter: Status validation
    if (status) {
      whereCondition.push({ status: status });
    }

    // 5. Filter: Date Availability Check
    if (availableDate) {
      const date = new Date(availableDate);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      whereCondition.push({
        NOT: {
          availabilities: {
            some: {
              blockedDate: {
                gte: date,
                lt: nextDate,
              },
              status: {
                in: ['BOOKED', 'UNAVAILABLE'],
              },
            },
          },
        },
      });
    }

    // 6. Filter: Price Range Constraints
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && !Number.isNaN(minPrice)) {
        priceFilter.gte = minPrice;
      }
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
        priceFilter.lte = maxPrice;
      }

      whereCondition.push({
        packages: {
          some: {
            price: priceFilter,
          },
        },
      });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    // 7. DB Query with Premium Subscription Priority Booster
    const [profiles, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where: finalWhere,
        include: {
          category: true,
          // Included to dynamically fetch active subscription tier pricing
          currentSubscription: {
            include: {
              plan: true,
            },
          },
          city: true,
          state: true,
          portfolioImages: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          packages: {
            select: {
              id: true,
              packageName: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          // CRITICAL: Sort by monthly subscription price descending to show top-tier premium plans first
          {
            currentSubscription: {
              plan: {
                priceMonthly: 'desc',
              },
            },
          },
          // Fallback user-defined sorting (e.g., createdAt, rating)
          {
            [sortBy || 'createdAt']: sortOrder || 'desc',
          },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.vendorProfile.count({ where: finalWhere }),
    ]);

    // 8. Map Data Outputs cleanly without percentage calculations
    const normalizedProfiles = profiles.map((profile) => {
      const packagePrices = (profile.packages || []).map((pkg) =>
        Number(pkg.price),
      );
      const lowestPackagePrice = packagePrices.length
        ? Math.min(...packagePrices)
        : null;
      const highestPackagePrice = packagePrices.length
        ? Math.max(...packagePrices)
        : null;

      return {
        id: profile.id,
        name: profile.user?.name || null,
        businessName: profile.businessName,
        email: profile.user?.email || null,
        phone: profile.phone || null,
        location: profile.location || null,
        city: profile.city?.name || null,
        state: profile.state?.name || null,
        category: profile.category?.name || null,
        speciality: profile.speciality || null,
        aboutMe: profile.aboutMe || null,
        thumbnailImage:
          profile.coverImage || profile.portfolioImages?.[0]?.mediaUrl || null,
        packagePriceRange: {
          low: lowestPackagePrice,
          high: highestPackagePrice,
        },
        // subscriptionTierPrice:
        //   profile.currentSubscription?.plan?.priceMonthly || 0,
      };
    });

    return {
      data: normalizedProfiles,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async getVendorProfilesHomePage(filterDTO) {
    const {
      sortBy,
      sortOrder,
      search,
      limit,
      locationSearch,
      category,
      availableDate,
      minPrice,
      city,
      state,
      maxPrice,
      status = 'APPROVED',
    } = filterDTO;

    const offset = filterDTO.getOffset();
    const whereCondition = [];

    // 1. Filter: Text search
    if (search) {
      whereCondition.push({
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { speciality: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // 2. Filter: Location strict search
    if (locationSearch) {
      whereCondition.push({
        OR: [{ location: { contains: locationSearch, mode: 'insensitive' } }],
      });
    }

    // 3. Filter: Service Category
    if (category) {
      whereCondition.push({ category: { slug: category } });
    }

    if (city) {
      whereCondition.push({ city: { slug: city } });
    }

    if (state) {
      whereCondition.push({ state: { slug: state } });
    }

    // 4. Filter: Status validation
    if (status) {
      whereCondition.push({ status: status });
    }

    // 5. Filter: Date Availability Check
    if (availableDate) {
      const date = new Date(availableDate);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      whereCondition.push({
        NOT: {
          availabilities: {
            some: {
              blockedDate: { gte: date, lt: nextDate },
              status: { in: ['BOOKED', 'UNAVAILABLE'] },
            },
          },
        },
      });
    }

    // 6. Filter: Price Range Constraints
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && !Number.isNaN(minPrice))
        priceFilter.gte = minPrice;
      if (maxPrice !== undefined && !Number.isNaN(maxPrice))
        priceFilter.lte = maxPrice;

      whereCondition.push({
        packages: {
          some: { price: priceFilter },
        },
      });
    }

    const bestPlan = await prisma.subscriptionPlan.findFirst({
      orderBy: { priceMonthly: 'desc' },
      select: { id: true, priceMonthly: true },
    });

    if (bestPlan && Number(bestPlan.priceMonthly) > 0) {
      whereCondition.push({
        currentSubscription: {
          is: {
            planId: bestPlan.id,
          },
        },
      });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    // 7. DB Query
    const [profiles, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where: finalWhere,
        include: {
          category: true,
          currentSubscription: {
            include: { plan: true },
          },
          city: true,
          state: true,
          portfolioImages: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          packages: {
            select: { id: true, packageName: true, price: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [
          {
            [sortBy || 'createdAt']: sortOrder || 'desc',
          },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.vendorProfile.count({ where: finalWhere }),
    ]);

    // 8. Map Data Outputs
    const normalizedProfiles = profiles.map((profile) => {
      const packagePrices = (profile.packages || []).map((pkg) =>
        Number(pkg.price),
      );
      const lowestPackagePrice = packagePrices.length
        ? Math.min(...packagePrices)
        : null;
      const highestPackagePrice = packagePrices.length
        ? Math.max(...packagePrices)
        : null;

      return {
        id: profile.id,
        name: profile.user?.name || null,
        businessName: profile.businessName,
        email: profile.user?.email || null,
        phone: profile.phone || null,
        location: profile.location || null,
        city: profile.city?.name || null,
        state: profile.state?.name || null,
        category: profile.category?.name || null,
        speciality: profile.speciality || null,
        aboutMe: profile.aboutMe || null,
        thumbnailImage:
          profile.coverImage || profile.portfolioImages?.[0]?.mediaUrl || null,
        packagePriceRange: {
          low: lowestPackagePrice,
          high: highestPackagePrice,
        },
      };
    });

    return {
      data: normalizedProfiles,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async getVendorProfilesCouple(coupleId, filterDTO) {
    const { sortBy, sortOrder, search, limit, category, status, city, state } =
      filterDTO;
    let { locationSearch, availableDate, minPrice, maxPrice } = filterDTO;
    const offset = filterDTO.getOffset();

    // Variables to hold the target city and state for percentage scoring
    let targetLocationForMatching = locationSearch || null;
    let targetCitySlugForMatching = city || null;
    let targetStateSlugForMatching = state || null;

    // 1. Fetch default preferences from CoupleProfile
    if (coupleId) {
      const couple = await prisma.coupleProfile.findUnique({
        where: { id: coupleId },
        select: {
          location: true,
          city: {
            select: { name: true, slug: true },
          },
          state: {
            select: { name: true, slug: true },
          },
          weldingDate: true,
          budget: true,
        },
      });

      if (!couple) {
        throw new AppError('Couple profile not found', 404);
      }

      // Fallback logic: Use couple's profile data if NOT explicitly filtered by client
      if (!targetLocationForMatching && couple.location) {
        targetLocationForMatching = couple.location;
      }
      if (!targetCitySlugForMatching && couple.city?.slug) {
        targetCitySlugForMatching = couple.city.slug;
      }
      if (!targetStateSlugForMatching && couple.state?.slug) {
        targetStateSlugForMatching = couple.state.slug;
      }

      if (!availableDate && couple.weldingDate) {
        availableDate = couple.weldingDate;
      }
      if (maxPrice === undefined && couple.budget !== null) {
        maxPrice = Number(couple.budget);
      }
    }

    const whereCondition = [];

    // 2. Filter: Search
    if (search) {
      whereCondition.push({
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { speciality: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // 3. Filter: Strict Location
    if (locationSearch) {
      whereCondition.push({
        location: { contains: locationSearch, mode: 'insensitive' },
      });
    }

    // 4. Filter: Category
    if (category) {
      whereCondition.push({ category: { slug: category } });
    }

    // Filter: City
    if (city) {
      whereCondition.push({ city: { slug: city } });
    }

    // Filter: State
    if (state) {
      whereCondition.push({ state: { slug: state } });
    }

    // 5. Filter: Status
    if (status) {
      whereCondition.push({ status: status });
    } else {
      whereCondition.push({ status: 'APPROVED' });
    }

    // 6. Filter: Availability
    if (availableDate) {
      const targetDate = new Date(availableDate);
      targetDate.setUTCHours(0, 0, 0, 0);

      whereCondition.push({
        NOT: {
          availabilities: {
            some: {
              blockedDate: targetDate,
              status: { in: ['BOOKED', 'UNAVAILABLE'] },
            },
          },
        },
      });
    }

    // 7. Filter: Price Budget
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
        priceFilter.gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
        priceFilter.lte = Number(maxPrice);
      }

      whereCondition.push({
        packages: {
          some: {
            price: priceFilter,
          },
        },
      });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    // 8. DB Query with Premium Vendors Boost
    const [profiles, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where: finalWhere,
        include: {
          category: true,
          city: true, // 🎯 CRITICAL: Included to check profile.city.slug for score
          state: true, // 🎯 CRITICAL: Included to check profile.state.slug for score
          currentSubscription: {
            include: { plan: true },
          },
          portfolioImages: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          packages: {
            select: { id: true, packageName: true, price: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          savedVendors: coupleId
            ? {
                where: { coupleProfileId: coupleId },
                select: { id: true },
              }
            : false,
        },
        orderBy: [
          {
            currentSubscription: {
              plan: { priceMonthly: 'desc' },
            },
          },
          {
            [sortBy || 'createdAt']: sortOrder || 'desc',
          },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.vendorProfile.count({ where: finalWhere }),
    ]);

    // 9. Normalize Result Payloads & Compute Dynamic Match Ratios
    const normalizedProfiles = profiles.map((profile) => {
      const packagePrices = (profile.packages || []).map((pkg) =>
        Number(pkg.price),
      );
      const lowestPackagePrice = packagePrices.length
        ? Math.min(...packagePrices)
        : null;
      const highestPackagePrice = packagePrices.length
        ? Math.max(...packagePrices)
        : null;

      const weights = [];

      // Criteria 1: Text Search
      if (search) {
        const q = search.toLowerCase();
        const hasMatch =
          profile.businessName?.toLowerCase().includes(q) ||
          profile.speciality?.toLowerCase().includes(q);
        weights.push(hasMatch ? 1 : 0);
      }

      // Criteria 2: Location String Match Score
      if (targetLocationForMatching) {
        const locationScore = calculateLocationMatchScore(
          profile.location,
          targetLocationForMatching,
        );
        weights.push(locationScore);
      }

      // 🎯 Criteria 3: City Match (Exact Slug Check)
      if (targetCitySlugForMatching) {
        const cityMatch = profile.city?.slug === targetCitySlugForMatching;
        weights.push(cityMatch ? 1 : 0);
      }

      // 🎯 Criteria 4: State Match (Exact Slug Check)
      if (targetStateSlugForMatching) {
        const stateMatch = profile.state?.slug === targetStateSlugForMatching;
        weights.push(stateMatch ? 1 : 0);
      }

      // Criteria 5: Category
      if (category) {
        weights.push(profile.category?.slug === category ? 1 : 0);
      }

      // Criteria 6: Availability
      if (availableDate) {
        weights.push(1);
      }

      // Criteria 7: Budget
      if (minPrice !== undefined || maxPrice !== undefined) {
        const minVal =
          minPrice !== undefined ? Number(minPrice) : Number.NEGATIVE_INFINITY;
        const maxVal =
          maxPrice !== undefined ? Number(maxPrice) : Number.POSITIVE_INFINITY;
        const intersects =
          lowestPackagePrice !== null &&
          highestPackagePrice !== null &&
          highestPackagePrice >= minVal &&
          lowestPackagePrice <= maxVal;
        weights.push(intersects ? 1 : 0);
      }

      const matchPercentage =
        weights.length === 0
          ? 100
          : Math.round(
              (weights.reduce((sum, val) => sum + val, 0) / weights.length) *
                100,
            );

      const isSaved =
        Array.isArray(profile.savedVendors) && profile.savedVendors.length > 0;

      return {
        id: profile.id,
        name: profile.user?.name || null,
        businessName: profile.businessName,
        email: profile.user?.email || null,
        phone: profile.phone || null,
        location: profile.location || null,
        category: profile.category?.name || null,
        state: profile.state?.name || null,
        city: profile.city?.name || null,
        matchPercentage,
        isSaved,
        thumbnailImage:
          profile.coverImage || profile.portfolioImages?.[0]?.mediaUrl || null,
        packagePriceRange: {
          low: lowestPackagePrice,
          high: highestPackagePrice,
        },
      };
    });

    const sortedByMatch = normalizedProfiles.sort(
      (a, b) => b.matchPercentage - a.matchPercentage,
    );

    return {
      data: sortedByMatch,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async getVendorProfilesAdmin(filterDTO) {
    const {
      sortBy,
      sortOrder,
      search,
      limit,
      locationSearch,
      category,
      availableDate,
      minPrice,
      maxPrice,
      status,
    } = filterDTO;

    const offset = filterDTO.getOffset();
    const whereCondition = [];

    if (search) {
      whereCondition.push({
        OR: [
          { businessName: { contains: search, mode: 'insensitive' } },
          { speciality: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (locationSearch) {
      whereCondition.push({
        OR: [{ location: { contains: locationSearch, mode: 'insensitive' } }],
      });
    }

    if (category) {
      whereCondition.push({ category: { slug: category } });
    }

    if (status) {
      whereCondition.push({ status: status });
    }

    if (availableDate) {
      const date = new Date(availableDate);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      whereCondition.push({
        NOT: {
          availabilities: {
            some: {
              blockedDate: {
                gte: date,
                lt: nextDate,
              },
              status: {
                in: ['BOOKED', 'UNAVAILABLE'],
              },
            },
          },
        },
      });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && !Number.isNaN(minPrice)) {
        priceFilter.gte = minPrice;
      }
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) {
        priceFilter.lte = maxPrice;
      }

      whereCondition.push({
        packages: {
          some: {
            price: priceFilter,
          },
        },
      });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    const [profiles, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where: finalWhere,
        include: {
          category: true,
          currentSubscription: {
            include: {
              plan: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.vendorProfile.count({ where: finalWhere }),
    ]);

    const normalizedProfiles = profiles.map((profile) => {
      return {
        id: profile.id,
        name: profile.user?.name || null,
        email: profile.user?.email || null,
        phone: profile.phone || null,
        location: profile.location || null,
        subscriptionPlan: profile.currentSubscription?.plan?.planName || null,
        subscriptionStatus: profile.currentSubscription?.status || null,
        price: profile.currentSubscription?.plan?.priceMonthly || null,
        status: profile.status,
        category: profile.category?.name || null,
        joinedAt: profile.createdAt,
      };
    });

    return {
      data: normalizedProfiles,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async getVendorProfileById(id) {
    const profile = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        portfolioImages: {
          orderBy: { sortOrder: 'asc' },
        },
        packages: true,
        currentSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Vendor profile not found', 404);
    }

    const isPaidPlan =
      Number(profile.currentSubscription?.plan?.priceMonthly || 0) > 0;

    const { currentSubscription, ...profileWithoutSubscription } = profile;

    if (!isPaidPlan) {
      const { socialLinks, ...freePlanProfile } = profileWithoutSubscription;
      return {
        ...freePlanProfile,
        isSocial: false,
      };
    }

    return {
      ...profileWithoutSubscription,
      isSocial: true,
    };
  }

  async getVendorProfileById2(id) {
    const profile = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        portfolioImages: {
          orderBy: { sortOrder: 'asc' },
        },
        packages: true,
        currentSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Vendor profile not found', 404);
    }

    return profile;
  }

  async getVendorProfileByUserId(userId) {
    const profile = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        category: true,
        city: true,
        state: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            avatarUrl: true,
          },
        },
        portfolioImages: {
          orderBy: { sortOrder: 'asc' },
        },
        currentSubscription: {
          include: {
            plan: true,
          },
        },
        packages: true,
      },
    });

    if (!profile) {
      throw new AppError('Vendor profile not found', 404);
    }

    const modifiedProfile = {
      id: profile.id,
      name: profile.user?.name || null,
      email: profile.user?.email || null,
      phone: profile.phone || null,
      businessName: profile.businessName || null,
      location: profile.location || null,
      category: profile.category?.name || null,
      highlightedServices: profile.highlightedServices || null,
      speciality: profile.speciality || null,
      aboutMe: profile.aboutMe || null,
      profileImage: profile.user.avatarUrl || null,
      portfolioImages: profile.portfolioImages || [],
      packages: profile.packages || [],
      city: profile.city || null,
      state: profile.state || null,
      subscriptionPlan: profile.currentSubscription || null,
    };

    return modifiedProfile;
  }

  async updateVendorProfile(id, profileImageUrl, imageUrls, data) {
    const existingProfile = await this.getVendorProfileById2(id);
    const portfolioLimit =
      existingProfile.currentSubscription?.plan?.portfolioLimit;
    const dtoData = {
      ...data.toDatabase(),
    };

    const userData = {};
    if (dtoData.name !== undefined) {
      userData.name = dtoData.name;
      delete dtoData.name;
    }
    if (dtoData.email !== undefined) {
      userData.email = dtoData.email?.toLowerCase();
      delete dtoData.email;
    }

    if (dtoData.cityId !== undefined) {
      dtoData.city = dtoData.cityId
        ? { connect: { id: dtoData.cityId } }
        : { disconnect: true };
      delete dtoData.cityId;
    }

    if (dtoData.stateId !== undefined) {
      dtoData.state = dtoData.stateId
        ? { connect: { id: dtoData.stateId } }
        : { disconnect: true };
      delete dtoData.stateId;
    }

    if (profileImageUrl) {
      userData.avatarUrl = profileImageUrl;
    }

    return prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: existingProfile.userId },
          data: userData,
        });
      }

      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        if (portfolioLimit !== undefined && portfolioLimit !== -1) {
          const currentPortfolioCount = await tx.vendorPortfolio.count({
            where: { vendorId: id },
          });

          if (currentPortfolioCount + imageUrls.length > portfolioLimit) {
            throw new AppError(
              `Portfolio limit exceeded. You can upload up to ${portfolioLimit} images in total.`,
              400,
            );
          }
        }

        const lastPortfolioImage = await tx.vendorPortfolio.findFirst({
          where: { vendorId: id },
          select: { sortOrder: true },
          orderBy: { sortOrder: 'desc' },
        });

        const startSortOrder = lastPortfolioImage
          ? lastPortfolioImage.sortOrder + 1
          : 0;

        await tx.vendorPortfolio.createMany({
          data: imageUrls.map((url, index) => ({
            vendorId: id,
            mediaUrl: url,
            sortOrder: startSortOrder + index,
          })),
        });
      }

      return tx.vendorProfile.update({
        where: { id },
        data: dtoData,
        include: {
          category: true,
        },
      });
    });
  }

  async updateVendorStatus(id, newStatus) {
    await this.getVendorProfileById(id);

    return prisma.vendorProfile.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async deleteVendorProfile(id) {
    await this.getVendorProfileById(id);

    await prisma.vendorProfile.delete({
      where: { id },
    });

    return true;
  }

  async searchVendorProfiles(query, categoryId, limit = 10, offset = 0) {
    const whereCondition = [];

    if (query) {
      whereCondition.push({
        OR: [
          { businessName: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { speciality: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (categoryId) {
      whereCondition.push({
        categoryId: categoryId,
      });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    const [profiles, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where: finalWhere,
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.vendorProfile.count({ where: finalWhere }),
    ]);

    return {
      data: profiles,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async uploadPortfolioImage(vendorId, imageUrl) {
    await this.getVendorProfileById(vendorId);

    const sortOrder =
      (await prisma.vendorPortfolio.findMany({
        where: { vendorId },
        select: { sortOrder: true },
        orderBy: { sortOrder: 'desc' },
        take: 1,
      })) || [];

    const nextSortOrder = sortOrder.length > 0 ? sortOrder[0].sortOrder + 1 : 0;

    return prisma.vendorPortfolio.create({
      data: {
        vendorId,
        mediaUrl: imageUrl,
        sortOrder: nextSortOrder,
      },
    });
  }

  async uploadPortfolioImages(vendorId, imageUrls) {
    await this.getVendorProfileById(vendorId);

    const sortOrders = await prisma.vendorPortfolio.findMany({
      where: { vendorId },
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' },
      take: 1,
    });

    const startSortOrder =
      sortOrders.length > 0 ? sortOrders[0].sortOrder + 1 : 0;

    const portfolioImages = imageUrls.map((url, index) => ({
      vendorId,
      mediaUrl: url,
      sortOrder: startSortOrder + index,
    }));

    return prisma.vendorPortfolio.createMany({
      data: portfolioImages,
    });
  }

  async getPortfolioImages(vendorId) {
    await this.getVendorProfileById(vendorId);

    return prisma.vendorPortfolio.findMany({
      where: { vendorId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async deletePortfolioImage(imageId) {
    const image = await prisma.vendorPortfolio.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new AppError('Portfolio image not found', 404);
    }

    await prisma.vendorPortfolio.delete({
      where: { id: imageId },
    });

    return true;
  }

  async reorderPortfolioImages(vendorId, images) {
    await this.getVendorProfileById(vendorId);

    const updates = images.map((item, index) =>
      prisma.vendorPortfolio.update({
        where: { id: item.id },
        data: { sortOrder: index },
      }),
    );

    await prisma.$transaction(updates);
    return true;
  }

  async updateCoverImage(vendorId, imageUrl) {
    await this.getVendorProfileById(vendorId);

    return prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { coverImage: imageUrl },
    });
  }

  async vendorSubscriptionPlanChange(vendorId, newPackageId) {
    const vendorProfile = await this.getVendorProfileById(vendorId);
    const currentSubscription = await prisma.vendorSubscription.findUnique({
      where: { id: vendorProfile.currentSubscriptionId },
      include: {
        vendor: {
          select: {
            stripeCustomerId: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!currentSubscription) {
      throw new AppError('Current subscription not found', 404);
    }
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPackageId },
    });

    if (!newPlan) {
      throw new AppError('New subscription plan not found', 404);
    }

    // if (currentSubscription.planId === newPackageId) {
    //   throw new AppError('Already subscribed to this plan', 400);
    // }

    if (Number(newPlan.priceMonthly) > 0) {
      return await this.paymentService.createSubscriptionUpdateSession({
        vendorId,
        currentSubscription,
        newPlan,
      });
    } else {
      // const startsAt = new Date();
      // const endsAt = new Date();
      // endsAt.setDate(startsAt.getDate() + 30);

      // await prisma.$transaction(async (tx) => {
      //   await tx.vendorSubscription.update({
      //     where: { id: currentSubscription.id },
      //     data: { status: 'INACTIVE' },
      //   });
      //   const newSubscription = await tx.vendorSubscription.create({
      //     data: {
      //       vendorId,
      //       planId: newPackageId,
      //       status: 'ACTIVE',
      //       startsAt,
      //       endsAt,
      //     },
      //   });
      //   await tx.vendorProfile.update({
      //     where: { id: vendorId },
      //     data: {
      //       currentSubscriptionId: newSubscription.id,
      //       stripeCustomerId: null,
      //     },
      //   });
      // });

      throw new AppError(
        'Free plan activation is currently unavailable. Please add a premium plan to your subscription to continue.',
        503,
      );
    }

    return newPlan;
  }
}

module.exports = VendorProfileService;
