const Joi = require('joi');

const createExpenseSchema = Joi.object({
  vendorName: Joi.string().trim().min(2).max(100).required(),
  categoryId: Joi.string().trim().required(),
  vendorPhone: Joi.string().trim().optional(),
  vendorEmail: Joi.string().email().trim().optional(),
  amount: Joi.number().min(0).required(),
  note: Joi.string().trim().max(500).optional(),
});

const updateExpenseSchema = Joi.object({
  vendorName: Joi.string().trim().min(2).max(100).optional(),
  categoryId: Joi.string().trim().optional(),
  vendorPhone: Joi.string().trim().optional(),
  vendorEmail: Joi.string().email().trim().optional(),
  amount: Joi.number().min(0).optional(),
  note: Joi.string().trim().max(500).optional(),
}).min(1);

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
};
