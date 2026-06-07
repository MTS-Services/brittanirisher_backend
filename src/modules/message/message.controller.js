const { asyncHandler } = require('../../middlewares/errorHandler');
const { filterMessageDTO } = require('./message.dto');
const MessageService = require('./message.services');

class MessageController {
  constructor() {
    this.categoryService = new MessageService();
  }

  create = asyncHandler(async (req, res) => {
    const result = await this.categoryService.create(req.body);
    res.sendCreated(result, 'Message created successfully');
  });

  getAll = asyncHandler(async (req, res) => {
    const filterDTO = new filterMessageDTO(req.query);
    const result = await this.categoryService.getAll(filterDTO);
    res.sendSuccess(
      result.data,
      'Message retrieved successfully',
      result.pagination,
    );
  });

  getById = asyncHandler(async (req, res) => {
    const result = await this.categoryService.getById(req.params.id);
    res.sendSuccess(result, 'Message retrieved successfully');
  });

  delete = asyncHandler(async (req, res) => {
    await this.categoryService.delete(req.params.id);
    res.sendSuccess(null, 'Message deleted successfully');
  });
}

module.exports = MessageController;
