const { asyncHandler, AppError } = require('../../middlewares/errorHandler');
const { CreateJobDTO, filterJobDTO, UpdateJobDTO } = require('./job.dto');
const JobService = require('./job.services');

class JobController {
  constructor() {
    this.jobService = new JobService();
  }

  /**
   * @route   POST /api/jobs
   * @desc    Create a new job post
   */
  createJob = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const dto = new CreateJobDTO(req.body);
    const result = await this.jobService.createJob(dto, userId);
    res.sendCreated(result, 'Job post created successfully');
  });

  /**
   * @route   GET /api/jobs
   * @desc    Get all job posts
   */
  getAllJobs = asyncHandler(async (req, res) => {
    const filterDTO = new filterJobDTO(req.query);
    const result = await this.jobService.getAllJobs(filterDTO);
    res.sendSuccess(
      result.data,
      'All jobs retrieved successfully',
      result.pagination,
    );
  });

  getAllJobsMy = asyncHandler(async (req, res) => {
    const filterDTO = new filterJobDTO(req.query);
    const userId = req.user.id;
    const result = await this.jobService.getAllJobs(filterDTO, userId);
    res.sendSuccess(
      result.data,
      'All jobs retrieved successfully',
      result.pagination,
    );
  });

  /**
   * @route   GET /api/jobs/:id
   * @desc    Get a single job by ID
   */
  getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await this.jobService.getJobById(id);
    if (!result) {
      throw new AppError('Job not found', 404);
    }
    res.sendSuccess(result, 'Job details retrieved successfully');
  });

  /**
   * @route   PATCH /api/jobs/:id
   * @desc    Update an existing job
   */
  updateJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const dto = new UpdateJobDTO(req.body);
    const result = await this.jobService.updateJob(id, dto);

    res.sendSuccess(result, 'Job post updated successfully');
  });

  /**
   * @route   DELETE /api/jobs/:id
   * @desc    Remove a job post
   */
  deleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.jobService.deleteJob(id);
    res.sendSuccess(null, 'Job post deleted successfully');
  });
}

module.exports = JobController;
