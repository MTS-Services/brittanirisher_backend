const { asyncHandler } = require('../../middlewares/errorHandler');
const { filterCoupleDTO } = require('./coupleProfile.dto');
const CoupleProfileService = require('./coupleProfile.services');

class CoupleProfileController {
  constructor(services) {
    this.services = new CoupleProfileService();
  }

  createCoupleProfile = asyncHandler(async (req, res) => {
    const result = await this.services.createCoupleProfile(req.body);
    res.sendCreated(result, 'Couple profile created successfully');
  });

  getAllCoupleProfiles = asyncHandler(async (req, res) => {
    const filterDTO = new filterCoupleDTO(req.query);
    const result = await this.services.getAllCoupleProfiles(filterDTO);
    res.sendSuccess(
      result.data,
      'Couple profiles retrieved successfully',
      result.pagination,
    );
  });

  getCoupleProfileById = asyncHandler(async (req, res) => {
    const result = await this.services.getCoupleProfileById(req.params.id);
    res.sendSuccess(result, 'Couple profile retrieved successfully');
  });

  getCoupleProfileByMe = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const result = await this.services.getCoupleProfileById(coupleProfileId);
    res.sendSuccess(result, 'Couple profile retrieved successfully');
  });

  getCoupleProfileDashboard = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const result =
      await this.services.getCoupleProfileDashboard(coupleProfileId);
    res.sendSuccess(result, 'Couple profile retrieved successfully');
  });

  updateCoupleProfile = asyncHandler(async (req, res) => {
    const imageUrl = `/uploads/${req.file.filename}`;
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const body = { ...req.body, profileImage: imageUrl };
    const result = await this.services.updateCoupleProfile(
      coupleProfileId,
      body,
    );
    res.sendSuccess(result, 'Couple profile updated successfully');
  });

  deleteCoupleProfile = asyncHandler(async (req, res) => {
    const coupleProfileId = req.params.id;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    await this.services.deleteCoupleProfile(coupleProfileId);
    res.sendSuccess(null, 'Couple profile deleted successfully');
  });
}

module.exports = CoupleProfileController;
