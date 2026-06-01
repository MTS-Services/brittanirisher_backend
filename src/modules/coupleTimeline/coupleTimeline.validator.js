const Joi = require('joi');

const coupleTimelineTaskCreateSchema = Joi.object({
  taskName: Joi.string().trim().min(1).required(),
  dueDate: Joi.date().iso().allow(null),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  taskNotes: Joi.string().trim().allow(null, ''),
  isCompleted: Joi.boolean().default(false),
  category: Joi.string().uuid().required(),
  order: Joi.number().integer().optional(),
});

const coupleTimelineTaskUpdateSchema = Joi.object({
  note: Joi.string().trim().min(2).max(100).optional(),
  orders: Joi.number().integer().optional(),
});

const coupleTimelineTaskStatusSchema = Joi.object({
  isCompleted: Joi.boolean().optional(),
  taskName: Joi.string().trim().optional(),
});

module.exports = {
  coupleTimelineTaskCreateSchema,
  coupleTimelineTaskUpdateSchema,
  coupleTimelineTaskStatusSchema,
};
