const { asyncHandler, AppError } = require('../../middlewares/errorHandler');
const {
  CreateVendorAvailabilityDTO,
  FilterVendorAvailabilityDTO,
  SetMonthlyAvailabilityDTO,
  UpdateVendorAvailabilityDTO,
} = require('./vendorAvailability.dto');
const VendorAvailabilityService = require('./vendorAvailability.services');

class VendorAvailabilityController {
  constructor() {
    this.vendorAvailabilityService = new VendorAvailabilityService();
  }

  ensureVendorAccess(req, record) {
    if (req.user.role !== 'VENDOR') {
      return;
    }

    if (!req.user.vendorProfileId) {
      throw new AppError('Vendor profile not found for current user', 403);
    }

    if (record && record.vendorId !== req.user.vendorProfileId) {
      throw new AppError('Access denied for this vendor availability', 403);
    }
  }

  createAvailability = asyncHandler(async (req, res) => {
    const dto = new CreateVendorAvailabilityDTO(req.body);
    const vendorId = req.user?.vendorProfileId;

    if (!vendorId) {
      throw new AppError('Vendor profile not found for current user', 403);
    }

    dto.vendorId = vendorId;
    const result = await this.vendorAvailabilityService.createAvailability(dto);
    res.sendCreated(result, 'Vendor availability created successfully');
  });

  setMonthlyAvailability = asyncHandler(async (req, res) => {
    const dto = req.body;
    const vendorId = req.user?.vendorProfileId;

    if (!vendorId) {
      throw new AppError('Vendor profile not found for current user', 403);
    }

    // dto.vendorId = vendorId;
    const result = await this.vendorAvailabilityService.updateBulkAvailability(
      vendorId,
      dto,
    );
    res.sendSuccess(result, 'Monthly availability saved successfully');
  });

  getCalendarByVendorAndMonth = asyncHandler(async (req, res) => {
    const { vendorId, year, month } = req.query;
    const result =
      await this.vendorAvailabilityService.getCalendarByVendorAndMonth(
        vendorId,
        Number(year),
        Number(month),
      );

    res.sendSuccess(result, 'Availability calendar retrieved successfully');
  });

  getAvailabilities = asyncHandler(async (req, res) => {
    const filterDTO = new FilterVendorAvailabilityDTO(req.query);

    if (req.user.role === 'VENDOR') {
      this.ensureVendorAccess(req);
      filterDTO.vendorId = req.user.vendorProfileId;
    }

    const result =
      await this.vendorAvailabilityService.getAvailabilities(filterDTO);
    res.sendSuccess(
      result.data,
      'Vendor availabilities retrieved successfully',
      result.pagination,
    );
  });

  getAvailabilityById = asyncHandler(async (req, res) => {
    const result = await this.vendorAvailabilityService.getAvailabilityById(
      req.params.id,
    );
    this.ensureVendorAccess(req, result);
    res.sendSuccess(result, 'Vendor availability retrieved successfully');
  });

  updateAvailability = asyncHandler(async (req, res) => {
    const existing = await this.vendorAvailabilityService.getAvailabilityById(
      req.params.id,
    );
    this.ensureVendorAccess(req, existing);

    const dto = new UpdateVendorAvailabilityDTO(req.body);
    const result = await this.vendorAvailabilityService.updateAvailability(
      req.params.id,
      dto,
    );

    res.sendSuccess(result, 'Vendor availability updated successfully');
  });

  deleteAvailability = asyncHandler(async (req, res) => {
    const existing = await this.vendorAvailabilityService.getAvailabilityById(
      req.params.id,
    );
    // this.ensureVendorAccess(req, existing);

    await this.vendorAvailabilityService.deleteAvailability(req.params.id);
    res.sendSuccess(null, 'Vendor availability deleted successfully');
  });
}

module.exports = VendorAvailabilityController;
