const { asyncHandler } = require('../../middlewares/errorHandler');
const WeddingScheduleService = require('./weddingDaySchedule.services');

class WeddingScheduleController {
  constructor() {
    this.categoryService = new WeddingScheduleService();
  }

  createWeddingSchedule = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const result = await this.categoryService.create(req.body, coupleProfileId);
    res.sendCreated(result, 'Wedding day schedule created successfully');
  });

  getWeddingSchedule = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const result = await this.categoryService.getByCoupleId(coupleProfileId);
    res.sendSuccess(result, 'Wedding day schedule retrieved successfully');
  });

  WeddingScheduleById = asyncHandler(async (req, res) => {
    const result = await this.categoryService.getById(req.params.id);
    res.sendSuccess(result, 'Wedding day schedule retrieved successfully');
  });

  updateWeddingSchedule = asyncHandler(async (req, res) => {
    const result = await this.categoryService.update(req.params.id, req.body);
    res.sendSuccess(result, 'Wedding day schedule updated successfully');
  });

  deleteWeddingSchedule = asyncHandler(async (req, res) => {
    await this.categoryService.delete(req.params.id);
    res.sendSuccess(null, 'Wedding day schedule deleted successfully');
  });
}

module.exports = WeddingScheduleController;
