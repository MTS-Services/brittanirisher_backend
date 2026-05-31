const { asyncHandler } = require('../../middlewares/errorHandler');
const VendorProfileService = require('./vendorProfile.services');
const {
  CreateVendorProfileDTO,
  UpdateVendorProfileDTO,
  VendorProfileResponseDTO,
  filterVendorDTO,
} = require('./vendorProfile.dto');

class VendorProfileController {
  constructor() {
    this.vendorProfileService = new VendorProfileService();
  }

  createVendorProfile = asyncHandler(async (req, res) => {
    const dto = new CreateVendorProfileDTO(req.body);

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: 'Please upload at least one image.' });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const result = await this.vendorProfileService.createVendorProfile(
      imageUrls,
      dto,
    );
    res.sendCreated(result, 'Vendor profile created successfully');
  });

  getVendorProfiles = asyncHandler(async (req, res) => {
    const filterDTO = new filterVendorDTO(req.query);

    const result = await this.vendorProfileService.getVendorProfiles(filterDTO);

    res.sendSuccess(
      result.data,
      'Vendor profiles retrieved successfully',
      result.pagination,
    );
  });

  getVendorProfilesAdmin = asyncHandler(async (req, res) => {
    const filterDTO = new filterVendorDTO(req.query);

    const result =
      await this.vendorProfileService.getVendorProfilesAdmin(filterDTO);

    res.sendSuccess(
      result.data,
      'Vendor profiles retrieved successfully',
      result.pagination,
    );
  });

  getVendorProfileById = asyncHandler(async (req, res) => {
    const result = await this.vendorProfileService.getVendorProfileById(
      req.params.id,
    );
    res.sendSuccess(result, 'Vendor profile retrieved successfully');
  });

  getMyVendorProfile = asyncHandler(async (req, res) => {
    const result = await this.vendorProfileService.getVendorProfileByUserId(
      req.user.id,
    );
    res.sendSuccess(result, 'Your vendor profile retrieved successfully');
  });

  updateVendorProfile = asyncHandler(async (req, res) => {
    const dto = new UpdateVendorProfileDTO(req.body);

    const vendorId = req.user.vendorProfileId;

    if (!vendorId) {
      return res.sendBadRequest('You do not have a vendor profile to update');
    }

    const hasBodyFields = Object.keys(req.body || {}).length > 0;
    const hasImages = Array.isArray(req.files) && req.files.length > 0;

    if (!hasBodyFields && !hasImages) {
      return res.sendBadRequest(
        'Provide at least one profile field or upload at least one image',
      );
    }

    const imageUrls = hasImages
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];
    const result = await this.vendorProfileService.updateVendorProfile(
      vendorId,
      imageUrls,
      dto,
    );
    res.sendSuccess(
      new VendorProfileResponseDTO(result),
      'Vendor profile updated successfully',
    );
  });

  updateVendorStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
      });
    }
    const result = await this.vendorProfileService.updateVendorStatus(
      req.params.id,
      status,
    );
    res.sendSuccess(result, 'Vendor profile status updated successfully');
  });

  updateSubscriptionPlanChange = asyncHandler(async (req, res) => {
    const { planId } = req.body;
    const vendorId = req.user.vendorProfileId;
    if (!vendorId) {
      return res.sendBadRequest('You do not have a vendor profile to update');
    }

    const result = await this.vendorProfileService.vendorSubscriptionPlanChange(
      vendorId,
      planId,
    );
    res.sendSuccess(result, 'Vendor profile updated successfully');
  });

  deleteVendorProfile = asyncHandler(async (req, res) => {
    await this.vendorProfileService.deleteVendorProfile(req.params.id);
    res.sendSuccess(null, 'Vendor profile deleted successfully');
  });

  searchVendorProfiles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const query = req.query.q;
    const categoryId = req.query.categoryId;

    const result = await this.vendorProfileService.searchVendorProfiles(
      query,
      categoryId,
      limit,
      offset,
    );

    res.sendSuccess(result.data, 'Search results retrieved successfully', {
      ...result.pagination,
      page,
    });
  });

  uploadCoverImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.sendBadRequest('No image file uploaded');
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const result = await this.vendorProfileService.updateCoverImage(
      req.params.id,
      imageUrl,
    );

    res.sendSuccess(
      { coverImage: imageUrl },
      'Cover image uploaded successfully',
    );
  });

  uploadPortfolioImage = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.sendBadRequest('No image file uploaded');
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const result = await this.vendorProfileService.uploadPortfolioImage(
      req.params.id,
      imageUrl,
    );

    res.sendCreated(
      { id: result.id, mediaUrl: result.mediaUrl },
      'Portfolio image uploaded successfully',
    );
  });

  uploadPortfolioImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.sendBadRequest('No image files uploaded');
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    await this.vendorProfileService.uploadPortfolioImages(
      req.params.id,
      imageUrls,
    );

    res.sendCreated(
      { urls: imageUrls },
      'Portfolio images uploaded successfully',
    );
  });

  getPortfolioImages = asyncHandler(async (req, res) => {
    const result = await this.vendorProfileService.getPortfolioImages(
      req.params.id,
    );

    res.sendSuccess(result, 'Portfolio images retrieved successfully');
  });

  deletePortfolioImage = asyncHandler(async (req, res) => {
    await this.vendorProfileService.deletePortfolioImage(req.params.imageId);

    res.sendSuccess(null, 'Portfolio image deleted successfully');
  });

  reorderPortfolioImages = asyncHandler(async (req, res) => {
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.sendBadRequest('Images array is required');
    }

    await this.vendorProfileService.reorderPortfolioImages(
      req.params.id,
      images,
    );

    res.sendSuccess(null, 'Portfolio images reordered successfully');
  });
}

module.exports = VendorProfileController;
