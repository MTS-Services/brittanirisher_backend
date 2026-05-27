const { asyncHandler } = require('../../middlewares/errorHandler');
const CoupleExpenseService = require('./coupleExpense.services');

class ExpenseController {
  constructor() {
    this.service = new CoupleExpenseService();
  }

  createExpense = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }

    const result = await this.service.create(req.body, coupleProfileId);
    res.sendCreated(result, 'Expense created successfully');
  });

  getAllExpense = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }

    const result = await this.service.getAll(coupleProfileId);
    res.sendSuccess(result, 'Expense retrieved successfully');
  });

  getByIdExpense = asyncHandler(async (req, res) => {
    const result = await this.service.getById(req.params.id);
    res.sendSuccess(result, 'Expense retrieved successfully');
  });

  updateExpense = asyncHandler(async (req, res) => {
    const result = await this.service.update(req.params.id, req.body);
    res.sendSuccess(result, 'Expense updated successfully');
  });

  deleteExpense = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.sendSuccess(null, 'Expense deleted successfully');
  });
}

module.exports = ExpenseController;
