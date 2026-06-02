const { asyncHandler } = require('../../middlewares/errorHandler');
const StateService = require('./states.services');

class StatesController {
  constructor() {
    this.service = new StateService();
  }

  create = asyncHandler(async (req, res) => {
    const result = await this.service.create(req.body);
    res.sendCreated(result, 'States created successfully');
  });

  getAll = asyncHandler(async (req, res) => {
    const result = await this.service.getAll();
    res.sendSuccess(result, 'States retrieved successfully');
  });

  getById = asyncHandler(async (req, res) => {
    const result = await this.service.getById(req.params.id);
    res.sendSuccess(result, 'States retrieved successfully');
  });

  update = asyncHandler(async (req, res) => {
    const result = await this.service.update(req.params.id, req.body);
    res.sendSuccess(result, 'States updated successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.sendSuccess(null, 'States deleted successfully');
  });
}

module.exports = StatesController;
