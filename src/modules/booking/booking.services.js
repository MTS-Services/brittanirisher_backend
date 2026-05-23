const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class BookingService {
  async ensureVendorExists(vendorId) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });

    if (!vendor) {
      throw new AppError('Vendor profile not found', 404);
    }
  }

  async ensurePackageValid(packageId, vendorId) {
    const pkg = await prisma.vendorPackage.findUnique({
      where: { id: packageId },
      select: { id: true, vendorId: true },
    });

    if (!pkg) {
      throw new AppError('Vendor package not found', 404);
    }

    if (vendorId && pkg.vendorId !== vendorId) {
      throw new AppError('Selected package does not belong to the vendor', 400);
    }
  }

  async createBooking(dto) {
    await Promise.all([
      this.ensureVendorExists(dto.vendorId),
      this.ensurePackageValid(dto.packageId, dto.vendorId),
    ]);

    return prisma.vendorBooking.create({
      data: {
        vendorId: dto.vendorId,
        coupleName: dto.coupleName,
        email: dto.email,
        phone: dto.phone,
        venueName: dto.venueName,
        location: dto.location,
        weddingDate: dto.weddingDate,
        price: dto.price,
        packageId: dto.packageId,
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
        package: {
          select: {
            id: true,
            packageName: true,
            price: true,
          },
        },
      },
    });
  }

  async getBookings(filterDTO) {
    const whereConditions = [];

    if (filterDTO.search) {
      whereConditions.push({
        OR: [
          { coupleName: { contains: filterDTO.search, mode: 'insensitive' } },
          { email: { contains: filterDTO.search, mode: 'insensitive' } },
          { phone: { contains: filterDTO.search, mode: 'insensitive' } },
          { venueName: { contains: filterDTO.search, mode: 'insensitive' } },
          { location: { contains: filterDTO.search, mode: 'insensitive' } },
        ],
      });
    }

    if (filterDTO.status) {
      whereConditions.push({ status: filterDTO.status });
    }

    if (filterDTO.vendorId) {
      whereConditions.push({ vendorId: filterDTO.vendorId });
    }

    if (filterDTO.packageId) {
      whereConditions.push({ packageId: filterDTO.packageId });
    }

    if (filterDTO.fromDate || filterDTO.toDate) {
      const weddingDate = {};
      if (filterDTO.fromDate) {
        weddingDate.gte = new Date(filterDTO.fromDate);
      }
      if (filterDTO.toDate) {
        weddingDate.lte = new Date(filterDTO.toDate);
      }

      whereConditions.push({ weddingDate });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};
    const offset = filterDTO.getOffset();

    const [data, total] = await Promise.all([
      prisma.vendorBooking.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              location: true,
            },
          },
          package: {
            select: {
              id: true,
              packageName: true,
              price: true,
            },
          },
        },
        orderBy: {
          [filterDTO.sortBy]: filterDTO.sortOrder,
        },
        skip: offset,
        take: filterDTO.limit,
      }),
      prisma.vendorBooking.count({ where }),
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

  async getBookingById(id) {
    const booking = await prisma.vendorBooking.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
        package: {
          select: {
            id: true,
            packageName: true,
            price: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return booking;
  }

  async updateBooking(id, dto) {
    const current = await this.getBookingById(id);
    const vendorId =
      dto.vendorId !== undefined ? dto.vendorId : current.vendorId;
    const packageId =
      dto.packageId !== undefined ? dto.packageId : current.packageId;

    if (dto.vendorId !== undefined) {
      await this.ensureVendorExists(dto.vendorId);
    }

    if (dto.packageId !== undefined || dto.vendorId !== undefined) {
      await this.ensurePackageValid(packageId, vendorId);
    }

    return prisma.vendorBooking.update({
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
        package: {
          select: {
            id: true,
            packageName: true,
            price: true,
          },
        },
      },
    });
  }

  async deleteBooking(id) {
    await this.getBookingById(id);

    return prisma.vendorBooking.delete({
      where: { id },
    });
  }
}

module.exports = BookingService;
