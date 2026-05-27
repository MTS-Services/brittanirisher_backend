const Joi = require('joi');

const createTaskSectionSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  tasks: Joi.array().items(Joi.string().trim()),
});

const updateTaskSectionSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).optional(),
  tasks: Joi.array().items(Joi.string().trim()).optional(),
});

const updateTaskStatusSchema = Joi.object({
  isCompleted: Joi.boolean().optional(),
  taskName: Joi.string().trim().optional(),
});

module.exports = {
  createTaskSectionSchema,
  updateTaskSectionSchema,
  updateTaskStatusSchema,
};
