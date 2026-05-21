const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const { JobSchema, updateJobSchema } = require('./job.validator');
const JobController = require('./job.controller');
const { validate } = require('../../validators/common.validator');
const router = express.Router();

const controller = new JobController();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'EMPLOYEE', 'USER']),
  validate(JobSchema),
  controller.createJob,
);
router.get('/', controller.getAllJobs);
router.get(
  '/my',
  authenticate,
  authorize(['ADMIN', 'EMPLOYEE', 'USER']),
  controller.getAllJobsMy,
);
router.get('/:id', controller.getJobById);
router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'EMPLOYEE', 'USER']),
  validate(updateJobSchema),
  controller.updateJob,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'EMPLOYEE', 'USER']),
  controller.deleteJob,
);

module.exports = router;
