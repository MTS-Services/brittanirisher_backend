const Joi = require('joi');

const createVendorProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().email().trim().required(),
  location: Joi.string().trim().min(2).max(200).required(),
  businessName: Joi.string().trim().min(2).max(150).required(),
  experienceYears: Joi.string().trim().max(100).optional(),
  speciality: Joi.string().trim().max(150).optional(),
  aboutMe: Joi.string().trim().max(2000).optional(),
  password: Joi.string().min(6).max(128).required(),
  package: Joi.array()
    .items(
      Joi.object({
        packageName: Joi.string().required(),
        price: Joi.number().required(),
        badge: Joi.string().required(),
        isActive: Joi.boolean().default(true),
        features: Joi.array().items(Joi.string().required()),
      }),
    )
    .required(),
  packageId: Joi.string().trim().optional(),
  categoryId: Joi.string().trim().required(),
});

const updateVendorProfileSchema = Joi.object({
  businessName: Joi.string().trim().min(2).max(150).optional(),
  location: Joi.string().trim().min(2).max(200).optional(),
  categoryId: Joi.string().trim().optional(),
  experienceYears: Joi.string().trim().max(100).optional(),
  speciality: Joi.string().trim().max(150).optional(),
  aboutMe: Joi.string().trim().max(2000).optional(),
  coverImage: Joi.string().uri().optional().allow(null, ''),
  isVerified: Joi.boolean().optional(),
}).min(1);

const vendorProfileIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const vendorFilterQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'businessName', 'location')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  search: Joi.string().trim().optional(),
  locationSearch: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  availableDate: Joi.date().iso().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
});

const userIdParamSchema = Joi.object({
  userId: Joi.string().trim().required(),
});

module.exports = {
  createVendorProfileSchema,
  updateVendorProfileSchema,
  vendorProfileIdParamSchema,
  vendorFilterQuerySchema,
  userIdParamSchema,
};
