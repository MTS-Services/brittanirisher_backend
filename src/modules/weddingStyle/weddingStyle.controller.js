const { asyncHandler } = require('../../middlewares/errorHandler');
const WeddingStyleService = require('./weddingStyle.services');

class WeddingStyleController {
  constructor() {
    this.weddingStyleService = new WeddingStyleService();
  }

  createWeddingStyle = asyncHandler(async (req, res) => {
    const result = await this.weddingStyleService.createWeddingStyle(req.body);
    res.sendCreated(result, 'Wedding style created successfully');
  });

  getWeddingStyles = asyncHandler(async (req, res) => {
    const result = await this.weddingStyleService.getWeddingStyles();
    res.sendSuccess(result, 'Wedding styles retrieved successfully');
  });

  getWeddingStyleById = asyncHandler(async (req, res) => {
    const result = await this.weddingStyleService.getWeddingStyleById(
      req.params.id,
    );
    res.sendSuccess(result, 'Wedding style retrieved successfully');
  });

  updateWeddingStyle = asyncHandler(async (req, res) => {
    const result = await this.weddingStyleService.updateWeddingStyle(
      req.params.id,
      req.body,
    );
    res.sendSuccess(result, 'Wedding style updated successfully');
  });

  deleteWeddingStyle = asyncHandler(async (req, res) => {
    await this.weddingStyleService.deleteWeddingStyle(req.params.id);
    res.sendSuccess(null, 'Wedding style deleted successfully');
  });
}

module.exports = WeddingStyleController;
