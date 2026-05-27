const { asyncHandler } = require('../../middlewares/errorHandler');
const { filterVendorDTO } = require('../vendorProfile/vendorProfile.dto');
const SaveVendorService = require('./saveVendor.services');

class SaveVendorController {
  constructor() {
    this.service = new SaveVendorService();
  }

  toggleSave = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const { vendorId } = req.body;
    const result = await this.service.toggleSave(coupleProfileId, vendorId);
    res.sendCreated(result, 'Vendor Toggle  successfully');
  });

  getSaveVendor = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }

    const filterDTO = new filterVendorDTO(req.query);
    const result = await this.service.getByCoupleId(coupleProfileId, filterDTO);
    res.sendSuccess(
      result.data,
      'Wedding day schedule retrieved successfully',
      result.pagination,
    );
  });
}

module.exports = SaveVendorController;
