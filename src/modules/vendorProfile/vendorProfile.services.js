const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const bcrypt = require('bcryptjs');
const { generateTokenPair } = require('../../utils/jwt');

class VendorProfileService {
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

      const tokens = generateTokenPair(user);
      await tx.session.create({
        data: {
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          joinedAt: user.joinedAt,
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
      maxPrice,
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
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.vendorProfile.count({ where: finalWhere }),
    ]);

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

      const criteria = [];

      if (search) {
        const q = search.toLowerCase();
        criteria.push(
          profile.businessName?.toLowerCase().includes(q) ||
            profile.speciality?.toLowerCase().includes(q),
        );
      }

      if (locationSearch) {
        criteria.push(
          profile.location
            ?.toLowerCase()
            .includes(locationSearch.toLowerCase()),
        );
      }

      if (category) {
        criteria.push(profile.category?.slug === category);
      }

      if (availableDate) {
        criteria.push(true);
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        const minVal =
          minPrice !== undefined ? minPrice : Number.NEGATIVE_INFINITY;
        const maxVal =
          maxPrice !== undefined ? maxPrice : Number.POSITIVE_INFINITY;
        const intersects =
          lowestPackagePrice !== null &&
          highestPackagePrice !== null &&
          highestPackagePrice >= minVal &&
          lowestPackagePrice <= maxVal;
        criteria.push(intersects);
      }

      const matchPercentage =
        criteria.length === 0
          ? 100
          : Math.round(
              (criteria.filter(Boolean).length / criteria.length) * 100,
            );

      return {
        ...profile,
        matchPercentage,
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
      },
    });

    if (!profile) {
      throw new AppError('Vendor profile not found', 404);
    }

    return profile;
  }

  async updateVendorProfile(id, imageUrls, data) {
    const existingProfile = await this.getVendorProfileById(id);
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

    return prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: existingProfile.userId },
          data: userData,
        });
      }

      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
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
}

module.exports = VendorProfileService;
