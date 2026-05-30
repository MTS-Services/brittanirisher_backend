const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class VendorPackageService {
  async createVendorPackage(data) {
    return prisma.vendorPackage.create({
      data: {
        ...data,
      },
    });
  }

  async getAllVendorPackages(vendorId) {
    return prisma.vendorPackage.findMany({
      where: { vendorId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getVendorPackageById(id) {
    const plan = await prisma.vendorPackage.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new AppError('vendor package not found', 404);
    }
    return plan;
  }

  // 4. Update a Subscription Plan
  async updateVendorPackage(id, data) {
    await this.getVendorPackageById(id);
    return prisma.vendorPackage.update({
      where: { id },
      data: data,
    });
  }

  // 5. Delete a Subscription Plan
  async deleteVendorPackage(id) {
    await this.getVendorPackageById(id);
    return prisma.vendorPackage.delete({
      where: { id },
    });
  }
}

module.exports = VendorPackageService;
