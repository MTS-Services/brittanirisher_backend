const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class EnquiryService {
  async ensureVendorExists(vendorId) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });

    if (!vendor) {
      throw new AppError('Vendor profile not found', 404);
    }
  }

  async ensureProfileExists(profileId) {
    if (!profileId) {
      return;
    }

    const profile = await prisma.coupleProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!profile) {
      throw new AppError('Couple profile not found', 404);
    }
  }

  async createEnquiry(dto) {
    await Promise.all([
      this.ensureVendorExists(dto.vendorId),
      this.ensureProfileExists(dto.profileId),
    ]);

    return prisma.enquiry.create({
      data: {
        vendorId: dto.vendorId,
        profileId: dto.profileId,
        senderName: dto.senderName,
        senderPhone: dto.senderPhone,
        senderEmail: dto.senderEmail,
        message: dto.message,
        ...(dto.status ? { status: dto.status } : {}),
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
        coupleProfile: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async getEnquiries(filterDTO) {
    const whereConditions = [];

    if (filterDTO.search) {
      whereConditions.push({
        OR: [
          { senderName: { contains: filterDTO.search, mode: 'insensitive' } },
          { senderEmail: { contains: filterDTO.search, mode: 'insensitive' } },
          { senderPhone: { contains: filterDTO.search, mode: 'insensitive' } },
          { message: { contains: filterDTO.search, mode: 'insensitive' } },
        ],
      });
    }

    if (filterDTO.status) {
      whereConditions.push({ status: filterDTO.status });
    }

    if (filterDTO.vendorId) {
      whereConditions.push({ vendorId: filterDTO.vendorId });
    }

    if (filterDTO.profileId) {
      whereConditions.push({ profileId: filterDTO.profileId });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};
    const offset = filterDTO.getOffset();

    const [data, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              location: true,
            },
          },
          coupleProfile: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          [filterDTO.sortBy]: filterDTO.sortOrder,
        },
        skip: offset,
        take: filterDTO.limit,
      }),
      prisma.enquiry.count({ where }),
    ]);

    return {
      data,
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

  async getEnquiryById(id) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
        coupleProfile: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!enquiry) {
      throw new AppError('Enquiry not found', 404);
    }

    return enquiry;
  }

  async updateEnquiry(id, dto) {
    if (dto.vendorId !== undefined) {
      await this.ensureVendorExists(dto.vendorId);
    }

    if (dto.profileId !== undefined) {
      await this.ensureProfileExists(dto.profileId);
    }

    return prisma.enquiry.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
        coupleProfile: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async deleteEnquiry(id) {
    await this.getEnquiryById(id);

    return prisma.enquiry.delete({
      where: { id },
    });
  }
}

module.exports = EnquiryService;
