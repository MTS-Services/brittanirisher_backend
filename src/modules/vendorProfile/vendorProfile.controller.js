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
    res.sendSuccess(
      new VendorProfileResponseDTO(result),
      'Your vendor profile retrieved successfully',
    );
  });

  updateVendorProfile = asyncHandler(async (req, res) => {
    const dto = new UpdateVendorProfileDTO(req.body);
    const result = await this.vendorProfileService.updateVendorProfile(
      req.params.id,
      dto.toDatabase(),
    );
    res.sendSuccess(
      new VendorProfileResponseDTO(result),
      'Vendor profile updated successfully',
    );
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
