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

  async getVendorProfiles(limit = 10, offset = 0) {
    const [profiles, total] = await Promise.all([
      prisma.vendorProfile.findMany({
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
      prisma.vendorProfile.count(),
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
      },
    });

    if (!profile) {
      throw new AppError('Vendor profile not found', 404);
    }

    return profile;
  }

  async updateVendorProfile(id, data) {
    await this.getVendorProfileById(id);

    // Verify category exists if being updated
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const updateData = {};

    if (data.businessName !== undefined)
      updateData.businessName = data.businessName;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.experienceYears !== undefined)
      updateData.experienceYears = data.experienceYears;
    if (data.speciality !== undefined) updateData.speciality = data.speciality;
    if (data.aboutMe !== undefined) updateData.aboutMe = data.aboutMe;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

    return prisma.vendorProfile.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
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
