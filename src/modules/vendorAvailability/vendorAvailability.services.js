const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class VendorAvailabilityService {
  normalizeDate(input) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new AppError('Invalid date value', 400);
    }

    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  getMonthRange(year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));
    return { startDate, endDate };
  }

  async ensureVendorExists(vendorId) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });

    if (!vendor) {
      throw new AppError('Vendor profile not found', 404);
    }
  }

  async createAvailability(dto) {
    await this.ensureVendorExists(dto.vendorId);

    return prisma.vendorAvailability.create({
      data: {
        vendorId: dto.vendorId,
        blockedDate: this.normalizeDate(dto.blockedDate),
        status: dto.status,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
      },
    });
  }

  async updateBulkAvailability(vendorId, datesArray) {
    await this.ensureVendorExists(vendorId);
    return await prisma.$transaction(
      datesArray.map((item) => {
        const targetDate = new Date(item.date);
        return prisma.vendorAvailability.upsert({
          where: {
            vendorId_blockedDate: {
              vendorId: vendorId,
              blockedDate: targetDate,
            },
          },
          update: {
            status: item.status,
          },
          create: {
            vendorId: vendorId,
            blockedDate: targetDate,
            status: item.status,
          },
        });
      }),
    );
  }

  async setMonthlyAvailability(dto) {
    await this.ensureVendorExists(dto.vendorId);

    const { startDate, endDate } = this.getMonthRange(dto.year, dto.month);
    const payload = dto.days
      .map((day) => ({
        vendorId: dto.vendorId,
        blockedDate: this.normalizeDate(day.blockedDate),
        status: day.status,
      }))
      .filter(
        (day) => day.blockedDate >= startDate && day.blockedDate < endDate,
      );

    const dedupedMap = new Map();
    payload.forEach((item) => {
      const key = item.blockedDate.toISOString().slice(0, 10);
      dedupedMap.set(key, item);
    });
    const dedupedDays = Array.from(dedupedMap.values());

    await prisma.$transaction(async (tx) => {
      await tx.vendorAvailability.deleteMany({
        where: {
          vendorId: dto.vendorId,
          blockedDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      if (dedupedDays.length > 0) {
        await tx.vendorAvailability.createMany({
          data: dedupedDays,
        });
      }
    });

    return this.getCalendarByVendorAndMonth(dto.vendorId, dto.year, dto.month);
  }

  async getCalendarByVendorAndMonth(vendorId, year, month) {
    // await this.ensureVendorExists(vendorId);
    const { startDate, endDate } = this.getMonthRange(year, month);

    const days = await prisma.vendorAvailability.findMany({
      where: {
        // vendorId,
        blockedDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        blockedDate: 'asc',
      },
      select: {
        id: true,
        blockedDate: true,
        status: true,
      },
    });

    return {
      vendorId,
      year,
      month,
      days,
    };
  }

  async getAvailabilities(filterDTO) {
    const whereConditions = [];

    if (filterDTO.search) {
      whereConditions.push({
        vendor: {
          businessName: {
            contains: filterDTO.search,
            mode: 'insensitive',
          },
        },
      });
    }

    if (filterDTO.vendorId) {
      whereConditions.push({ vendorId: filterDTO.vendorId });
    }

    if (filterDTO.status) {
      whereConditions.push({ status: filterDTO.status });
    }

    if (filterDTO.fromDate || filterDTO.toDate) {
      const blockedDate = {};
      if (filterDTO.fromDate) {
        blockedDate.gte = this.normalizeDate(filterDTO.fromDate);
      }
      if (filterDTO.toDate) {
        blockedDate.lte = this.normalizeDate(filterDTO.toDate);
      }

      whereConditions.push({ blockedDate });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};
    const offset = filterDTO.getOffset();

    const [data, total] = await Promise.all([
      prisma.vendorAvailability.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              businessName: true,
              location: true,
            },
          },
        },
        orderBy: {
          [filterDTO.sortBy]: filterDTO.sortOrder,
        },
        skip: offset,
        take: filterDTO.limit,
      }),
      prisma.vendorAvailability.count({ where }),
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

  async getAvailabilityById(id) {
    const availability = await prisma.vendorAvailability.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
      },
    });

    if (!availability) {
      throw new AppError('Vendor availability not found', 404);
    }

    return availability;
  }

  async updateAvailability(id, dto) {
    return prisma.vendorAvailability.update({
      where: { id },
      data: {
        ...(dto.blockedDate !== undefined
          ? { blockedDate: this.normalizeDate(dto.blockedDate) }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
          },
        },
      },
    });
  }

  async deleteAvailability(id) {
    return prisma.vendorAvailability.delete({
      where: { id },
    });
  }
}

module.exports = VendorAvailabilityService;
