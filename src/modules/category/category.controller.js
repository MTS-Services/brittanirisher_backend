const { asyncHandler } = require('../../middlewares/errorHandler');
const CategoryService = require('./category.services');

class CategoryController {
  constructor() {
    this.categoryService = new CategoryService();
  }

  createCategory = asyncHandler(async (req, res) => {
    const result = await this.categoryService.createCategory(req.body);
    res.sendCreated(result, 'Category created successfully');
  });

  getCategories = asyncHandler(async (req, res) => {
    const result = await this.categoryService.getCategories();
    res.sendSuccess(result, 'Categories retrieved successfully');
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const result = await this.categoryService.getCategoryById(req.params.id);
    res.sendSuccess(result, 'Category retrieved successfully');
  });

  updateCategory = asyncHandler(async (req, res) => {
    const result = await this.categoryService.updateCategory(
      req.params.id,
      req.body,
    );
    res.sendSuccess(result, 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await this.categoryService.deleteCategory(req.params.id);
    res.sendSuccess(null, 'Category deleted successfully');
  });
}

module.exports = CategoryController;
