const { asyncHandler } = require('../../middlewares/errorHandler');
const {
  CreateVendorPackageDto,
  UpdateVendorPackageDto,
} = require('./vendorPackage.dto');
const VendorPackageService = require('./vendorPackage.services');

class vendorPackageController {
  constructor() {
    this.vendorPackageService = new VendorPackageService();
  }

  createVendorPackage = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorProfileId;
    req.body.vendorId = vendorId;
    const dto = new CreateVendorPackageDto(req.body);
    const result = await this.vendorPackageService.createVendorPackage(dto);
    res.sendCreated(result, 'Vendor package created successfully');
  });

  getAllVendorPackages = asyncHandler(async (req, res) => {
    const plans = await this.vendorPackageService.getAllVendorPackages();
    res.sendSuccess(plans, 'Vendor package retrieved successfully');
  });

  getVendorPackageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const plan = await this.vendorPackageService.getVendorPackageById(id);
    res.sendSuccess(plan, 'Vendor package retrieved successfully');
  });

  updateVendorPackage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dto = new UpdateVendorPackageDto(req.body);
    const result = await this.vendorPackageService.updateVendorPackage(id, dto);
    res.sendSuccess(result, 'Vendor package updated successfully');
  });

  deleteVendorPackage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.vendorPackageService.deleteVendorPackage(id);
    res.sendSuccess(null, 'Vendor package deleted successfully');
  });
}

module.exports = vendorPackageController;
