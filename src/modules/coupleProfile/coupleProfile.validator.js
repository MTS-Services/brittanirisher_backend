const Joi = require('joi');

const createCoupleProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().email().trim().required(),
  phone: Joi.string().trim().optional(),
  location: Joi.string().trim().min(2).max(200).required(),
  weldingStyleId: Joi.string().trim().required(),
  cityId: Joi.string().trim().required(),
  stateId: Joi.string().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  weldingDate: Joi.date().iso().required(),
  budget: Joi.number().min(0).required(),
});

const updateCoupleProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  phone: Joi.string().trim().optional(),
  location: Joi.string().trim().min(2).max(200).optional(),
  weldingStyleId: Joi.string().trim().optional(),
  weldingDate: Joi.date().iso().optional(),
  budget: Joi.number().min(0).optional(),
  cityId: Joi.string().trim().optional(),
  stateId: Joi.string().trim().optional(),
}).min(1);

module.exports = {
  createCoupleProfileSchema,
  updateCoupleProfileSchema,
};
