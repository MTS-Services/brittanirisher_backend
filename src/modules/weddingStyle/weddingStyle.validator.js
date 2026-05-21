const Joi = require('joi');

const createWeddingStyleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

const updateWeddingStyleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
}).min(1);

const weddingStyleIdParamSchema = Joi.object({
  id: Joi.string().trim().required(),
});

module.exports = {
  createWeddingStyleSchema,
  updateWeddingStyleSchema,
  weddingStyleIdParamSchema,
};
