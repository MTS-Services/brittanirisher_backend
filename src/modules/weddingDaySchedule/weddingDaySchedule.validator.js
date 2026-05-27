const Joi = require('joi');

const createScheduleSchema = Joi.object({
  eventName: Joi.string().trim().min(2).max(150).required(),
  location: Joi.string().trim().min(2).max(200).required(),
  startTime: Joi.string().trim().required(),
  sortOrder: Joi.number().integer().min(0).optional().default(0),
});

const updateScheduleSchema = Joi.object({
  eventName: Joi.string().trim().min(2).max(150).optional(),
  location: Joi.string().trim().min(2).max(200).optional(),
  startTime: Joi.string().trim().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
}).min(1);

module.exports = {
  createScheduleSchema,
  updateScheduleSchema,
};
