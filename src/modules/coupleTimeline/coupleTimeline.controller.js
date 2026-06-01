const { asyncHandler } = require('../../middlewares/errorHandler');
const CoupleTimelineService = require('./coupleTimeline.services');

class TaskSectionController {
  constructor() {
    this.service = new CoupleTimelineService();
  }

  createTaskSection = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const result = await this.service.createTimelineTask(
      req.body,
      coupleProfileId,
    );
    res.sendCreated(result, 'Task created successfully');
  });

  getTaskSection = asyncHandler(async (req, res) => {
    const coupleProfileId = req.user.coupleProfileId;
    if (!coupleProfileId) {
      return res
        .status(404)
        .json({ message: 'Couple profile not found for the user' });
    }
    const result = await this.service.getAll(coupleProfileId);
    res.sendSuccess(result, 'Task Section retrieved successfully');
  });

  getTaskSectionById = asyncHandler(async (req, res) => {
    const result = await this.service.getById(req.params.id);
    res.sendSuccess(result, 'Task Section retrieved successfully');
  });

  updateTaskSection = asyncHandler(async (req, res) => {
    const result = await this.service.update(req.params.id, req.body);
    res.sendSuccess(result, 'Task Section updated successfully');
  });

  updateTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const data = req.body;
    const result = await this.service.updateTask(taskId, data);
    res.sendSuccess(result, 'Task status updated successfully');
  });

  deleteTaskSection = asyncHandler(async (req, res) => {
    await this.service.delete(req.params.id);
    res.sendSuccess(null, 'Task Section deleted successfully');
  });

  deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    await this.service.deleteTask(taskId);
    res.sendSuccess(null, 'Task deleted successfully');
  });
}

module.exports = TaskSectionController;
