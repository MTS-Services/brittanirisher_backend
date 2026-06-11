const Joi = require('joi');

const createSubscriptionPlanSchema = Joi.object({
  planName: Joi.string().trim().min(2).max(120).required(),
  priceMonthly: Joi.number().precision(2).min(0).required(),
  sortDescription: Joi.string().trim().min(2).max(520).required(),
  validFor: Joi.string().trim().min(2).max(220).optional(),
  portfolioLimit: Joi.number().integer().min(-1).default(10),
  featuresAllowed: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        isIncluded: Joi.boolean().default(true),
      }),
    )
    .required(),
});

const updateSubscriptionPlanSchema = Joi.object({
  planName: Joi.string().trim().min(2).max(120).optional(),
  sortDescription: Joi.string().trim().min(2).max(520).optional(),
  validFor: Joi.string().trim().min(2).max(220).optional(),
  priceMonthly: Joi.number().precision(2).min(0).optional(),
  portfolioLimit: Joi.number().integer().min(-1).optional(),
  featuresAllowed: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        isIncluded: Joi.boolean().default(true),
      }),
    )
    .optional(),
}).min(1);

const subscriptionPlanIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

module.exports = {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  subscriptionPlanIdParamSchema,
};
