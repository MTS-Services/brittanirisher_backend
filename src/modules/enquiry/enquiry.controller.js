const { asyncHandler, AppError } = require('../../middlewares/errorHandler');
const {
  CreateEnquiryDTO,
  FilterEnquiryDTO,
  UpdateEnquiryDTO,
} = require('./enquiry.dto');
const EnquiryService = require('./enquiry.services');

class EnquiryController {
  constructor() {
    this.enquiryService = new EnquiryService();
  }

  ensureVendorAccess(req, enquiry) {
    if (req.user.role !== 'VENDOR') {
      return;
    }

    if (!req.user.vendorProfileId) {
      throw new AppError('Vendor profile not found for current user', 403);
    }

    if (enquiry && enquiry.vendorId !== req.user.vendorProfileId) {
      throw new AppError('Access denied for this enquiry', 403);
    }
  }

  createEnquiry = asyncHandler(async (req, res) => {
    const dto = new CreateEnquiryDTO({
      ...req.body,
      profileId: req.user?.coupleProfileId || req.body.profileId || null,
    });

    const result = await this.enquiryService.createEnquiry(dto);
    res.sendCreated(result, 'Enquiry created successfully');
  });

  getEnquiries = asyncHandler(async (req, res) => {
    const filterDTO = new FilterEnquiryDTO(req.query);

    if (req.user.role === 'VENDOR') {
      this.ensureVendorAccess(req);
      filterDTO.vendorId = req.user.vendorProfileId;
    }

    const result = await this.enquiryService.getEnquiries(filterDTO);
    res.sendSuccess(
      result.data,
      'Enquiries retrieved successfully',
      result.pagination,
    );
  });

  getEnquiryById = asyncHandler(async (req, res) => {
    const result = await this.enquiryService.getEnquiryById(req.params.id);
    this.ensureVendorAccess(req, result);
    res.sendSuccess(result, 'Enquiry retrieved successfully');
  });

  updateEnquiry = asyncHandler(async (req, res) => {
    const existingEnquiry = await this.enquiryService.getEnquiryById(
      req.params.id,
    );
    this.ensureVendorAccess(req, existingEnquiry);

    const dto = new UpdateEnquiryDTO(req.body);
    const result = await this.enquiryService.updateEnquiry(req.params.id, dto);

    res.sendSuccess(result, 'Enquiry updated successfully');
  });

  deleteEnquiry = asyncHandler(async (req, res) => {
    const existingEnquiry = await this.enquiryService.getEnquiryById(
      req.params.id,
    );
    this.ensureVendorAccess(req, existingEnquiry);

    await this.enquiryService.deleteEnquiry(req.params.id);
    res.sendSuccess(null, 'Enquiry deleted successfully');
  });
}

module.exports = EnquiryController;
