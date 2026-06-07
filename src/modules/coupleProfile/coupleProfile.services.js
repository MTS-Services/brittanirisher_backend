const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');
const bcrypt = require('bcryptjs');
const { generateTokenPair } = require('../../utils/jwt');

class CoupleProfileService {
  async createCoupleProfile(profileData) {
    const {
      name,
      email,
      phone,
      location,
      weldingStyleId,
      password,
      weldingDate,
      budget,
      eventDate,
      cityId,
      stateId,
    } = profileData;

    const isEmailTaken = await prisma.user.findUnique({
      where: { email },
    });

    if (isEmailTaken) {
      throw new AppError('Email is already in use', 400);
    }

    const isWeldingStyleValid = await prisma.weddingStyle.findUnique({
      where: { id: weldingStyleId },
    });

    if (!isWeldingStyleValid) {
      throw new AppError('Invalid welding style ID', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          role: 'COUPLE',
          status: 'ACTIVE',
          emailVerified: true,
          phone,
        },
      });

      const coupleProfile = await tx.coupleProfile.create({
        data: {
          userId: user.id,
          name,
          phone,
          location,
          weldingStyleId,
          weldingDate,
          budget,
          eventDate,
          cityId,
          stateId,
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

  async getAllCoupleProfiles(filterDTO) {
    const { sortBy, sortOrder, search, limit, page } = filterDTO;

    const offset = filterDTO.getOffset();
    const whereCondition = [];

    if (search) {
      whereCondition.push({
        name: {
          contains: search,
          mode: 'insensitive',
        },
      });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    const [coupleProfiles, total] = await prisma.$transaction([
      prisma.coupleProfile.findMany({
        where: finalWhere,
        include: {
          city: true,
          state: true,
          weldingStyle: true,
          user: {
            select: { email: true, phone: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.coupleProfile.count({ where: finalWhere }),
    ]);

    const updateData = coupleProfiles.map((profile) => ({
      name: profile.name,
      email: profile.user.email,
      phone: profile.phone,
      location: profile.location,
      weldingStyle: profile.weldingStyle ? profile.weldingStyle.name : null,
      city: profile.city ? profile.city.name : null,
      state: profile.state ? profile.state.name : null,
      weldingDate: profile.weldingDate,
      budget: Number(profile.budget),
      expendBudget: Number(profile.expendBudget),
      remainingBudget: profile.budget - profile.expendBudget,
    }));

    return {
      data: updateData,
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

  async getCoupleProfileById(id) {
    const coupleProfile = await prisma.coupleProfile.findUnique({
      include: {
        city: true,
        state: true,
      },
      where: { id },
    });

    if (!coupleProfile) {
      throw new AppError('Couple profile not found', 404);
    }
    return {
      ...coupleProfile,
      city: coupleProfile.city ? coupleProfile.city.name : null,
      state: coupleProfile.state ? coupleProfile.state.name : null,
      budget: Number(coupleProfile.budget),
      expendBudget: Number(coupleProfile.expendBudget),
      remainingBudget: coupleProfile.budget - coupleProfile.expendBudget,
    };
  }

  async getCoupleProfileDashboard(id) {
    const coupleProfile = await prisma.coupleProfile.findUnique({
      where: { id },
    });

    if (!coupleProfile) {
      throw new AppError('Couple profile not found', 404);
    }

    const remainingDate = coupleProfile.weldingDate - new Date();

    return {
      remainingDate: Math.ceil(remainingDate / (1000 * 60 * 60 * 24)),
      budget: Number(coupleProfile.budget),
      expendBudget: Number(coupleProfile.expendBudget),
      remainingBudget: coupleProfile.budget - coupleProfile.expendBudget,
    };
  }

  async updateCoupleProfile(id, updateData) {
    const existingProfile = await prisma.coupleProfile.findUnique({
      where: { id },
    });
    if (!existingProfile) {
      throw new AppError('Couple profile not found', 404);
    }
    const updatedProfile = await prisma.coupleProfile.update({
      where: { id },
      data: updateData,
    });
    return updatedProfile;
  }

  async deleteCoupleProfile(id) {
    const existingProfile = await prisma.coupleProfile.findUnique({
      where: { id },
    });
    if (!existingProfile) {
      throw new AppError('Couple profile not found', 404);
    }
    await prisma.coupleProfile.delete({
      where: { id },
    });
  }
}

module.exports = CoupleProfileService;
