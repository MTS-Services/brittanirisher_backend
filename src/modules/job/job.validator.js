const Joi = require('joi');

// Helper for the JSON form config based on your UI
const fieldConfig = Joi.object({
  ask: Joi.boolean().required(),
  required: Joi.boolean().required(),
});

const JobSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  companyName: Joi.string().trim().required(),
  companyLogo: Joi.string().allow(null, ''),
  location: Joi.string().trim().required(),
  salaryRange: Joi.string().trim().allow(null, ''),

  shortDescription: Joi.string().trim().min(10).required(),
  aboutRole: Joi.string().trim().min(10).required(),
  responsibilities: Joi.array().items(Joi.string().trim()).min(1).required(),
  requirements: Joi.array().items(Joi.string().trim()).min(1).required(),
  benefits: Joi.array().items(Joi.string().trim()).required(),
  deadline: Joi.date().greater('now').required().messages({
    'date.greater': 'Deadline must be a future date',
  }),
  contactEmail: Joi.string().email().required(),

  // The UI configuration from the image
  formConfig: Joi.object({
    resume: fieldConfig.required(),
    coverLetter: fieldConfig.required(),
    workExperience: fieldConfig.required(),
    educationDetails: fieldConfig.required(),
    skills: fieldConfig.required(),
    personalWebsite: fieldConfig.required(),
    linkedInProfile: fieldConfig.required(),
    gitHubProfile: fieldConfig.required(),
  }).required(),

  // Foreign keys
  jobTypeId: Joi.string().uuid().optional(),
  categoryId: Joi.string().uuid().optional(),
  experienceLevelId: Joi.string().uuid().optional(),
});

const fieldConfigUpdate = Joi.object({
  ask: Joi.boolean(),
  required: Joi.boolean(),
});

const updateJobSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).optional(),
  companyName: Joi.string().trim().optional(),
  companyLogo: Joi.string().allow(null, '').optional(),
  location: Joi.string().trim().optional(),
  salaryRange: Joi.string().trim().allow(null, '').optional(),

  shortDescription: Joi.string().trim().min(10).optional(),
  aboutRole: Joi.string().trim().min(10).optional(),

  responsibilities: Joi.array().items(Joi.string().trim()).min(1).optional(),
  requirements: Joi.array().items(Joi.string().trim()).min(1).optional(),
  benefits: Joi.array().items(Joi.string().trim()).optional(),

  deadline: Joi.date().greater('now').optional(),
  contactEmail: Joi.string().email().optional(),

  formConfig: Joi.object({
    resume: fieldConfigUpdate,
    coverLetter: fieldConfigUpdate,
    workExperience: fieldConfigUpdate,
    educationDetails: fieldConfigUpdate,
    skills: fieldConfigUpdate,
    personalWebsite: fieldConfigUpdate,
    linkedInProfile: fieldConfigUpdate,
    gitHubProfile: fieldConfigUpdate,
  }).optional(),

  jobTypeId: Joi.string().uuid().optional(),
  categoryId: Joi.string().uuid().optional(),
  experienceLevelId: Joi.string().uuid().optional(),
}).min(1);

// module.exports = {
//   updateJobSchema,
//   JobSchema,
// };

module.exports = {
  updateJobSchema,
  JobSchema,
};
