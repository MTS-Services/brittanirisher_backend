const Joi = require('joi');

const createMessageSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(100).required(),
  lastName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  subject: Joi.string().trim().min(2).max(200).required(),
  message: Joi.string().trim().min(5).max(5000).required(),
});

const updateMessageSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(100).optional(),
  lastName: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().email().optional(),
  subject: Joi.string().trim().min(2).max(200).optional(),
  message: Joi.string().trim().min(5).max(5000).optional(),
}).min(1);

module.exports = {
  createMessageSchema,
  updateMessageSchema,
};
