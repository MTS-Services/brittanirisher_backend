const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class SaveVendorService {
  async toggleSave(coupleProfileId, vendorId) {
    const coupleExists = await prisma.coupleProfile.findUnique({
      where: { id: coupleProfileId },
    });
    const vendorExists = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!coupleExists) throw new AppError('Couple profile not found', 404);
    if (!vendorExists) throw new AppError('Vendor profile not found', 404);
    const existingSaved = await prisma.savedVendor.findFirst({
      where: { coupleProfileId, vendorId },
    });

    if (existingSaved) {
      await prisma.savedVendor.delete({
        where: { id: existingSaved.id },
      });
      return { saved: false, message: 'Vendor removed from saved list' };
    } else {
      const newSave = await prisma.savedVendor.create({
        data: { coupleProfileId, vendorId },
      });
      return {
        saved: true,
        message: 'Vendor saved successfully',
        data: newSave,
      };
    }
  }

  async getByCoupleId(coupleProfileId, filterDTO) {
    const { page, limit, sortBy, sortOrder } = filterDTO;
    const offset = filterDTO.getOffset();
    const whereCondition = [];

    if (coupleProfileId) {
      whereCondition.push({ coupleProfileId });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};

    const [profiles, total] = await Promise.all([
      prisma.savedVendor.findMany({
        where: finalWhere,
        include: {
          vendor: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              currentSubscription: {
                include: { plan: true },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              location: true,
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
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.savedVendor.count({ where: finalWhere }),
    ]);

    const result = profiles.map((item) => {
      const vendor = item.vendor;

      const prices = vendor.packages
        .map((pkg) => pkg.price)
        .filter((price) => price != null);

      let priceRange = null;
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        priceRange =
          minPrice === maxPrice
            ? `$${minPrice.toLocaleString()}`
            : `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
      }

      return {
        id: vendor.id,
        name: vendor.user.name,
        category: vendor.category?.name || null,
        location: vendor.location,
        portfolioImage:
          vendor.portfolioImages[0]?.mediaUrl ||
          vendor.portfolioImages[0]?.url ||
          null,
        priceRange: priceRange,
        vendorBadge: vendor.currentSubscription?.plan?.badge || null,
      };
    });

    return {
      data: result,
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

  async delete(id) {
    await this.getById(id);

    await prisma.savedVendor.delete({
      where: { id },
    });
    return { message: 'Schedule event deleted successfully' };
  }
}

module.exports = SaveVendorService;
