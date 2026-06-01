const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class CoupleTimelineService {
  async createTimelineTask(taskData, coupleProfileId) {
    const { category, taskName, dueDate, priority, taskNotes, isCompleted } =
      taskData;

    return await prisma.$transaction(async (tx) => {
      const section = await tx.coupleTimelineSection.upsert({
        where: {
          coupleProfileId_category: {
            coupleProfileId: coupleProfileId,
            category: category,
          },
        },
        update: {},
        create: {
          category: category,
          coupleProfileId: coupleProfileId,
          order: 0,
        },
      });

      const newTask = await tx.coupleTimelineTask.create({
        data: {
          taskName,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
          taskNotes,
          isCompleted,
          coupleTimelineSectionId: section.id,
          isCustom: true,
        },
      });

      return newTask;
    });
  }

  // async getAll(coupleProfileId) {
  //   const sections = await prisma.coupleTimelineSection.findMany({
  //     where: { coupleProfileId },
  //     include: {
  //       tasks: {
  //         orderBy: { createdAt: 'asc' },
  //       },
  //     },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   return sections.map((section) => {
  //     const totalTasks = section.tasks.length;
  //     const completedTasks = section.tasks.filter(
  //       (task) => task.isCompleted,
  //     ).length;

  //     const completionPercentage =
  //       totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  //     return {
  //       ...section,
  //       totalTasks,
  //       completedTasks,
  //       completionPercentage,
  //     };
  //   });
  // }

  async getAll(coupleProfileId) {
    const sections = await prisma.coupleTimelineSection.findMany({
      where: { coupleProfileId },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let overallTotalTasks = 0;
    let overallCompletedTasks = 0;

    const formattedSections = sections.map((section) => {
      const totalTasks = section.tasks.length;
      const completedTasks = section.tasks.filter(
        (task) => task.isCompleted,
      ).length;

      overallTotalTasks += totalTasks;
      overallCompletedTasks += completedTasks;

      const completionPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...section,
        totalTasks,
        completedTasks,
        completionPercentage,
      };
    });

    const overallCompletionPercentage =
      overallTotalTasks > 0
        ? Math.round((overallCompletedTasks / overallTotalTasks) * 100)
        : 0;

    return {
      sections: formattedSections,
      summary: {
        totalTasks: overallTotalTasks,
        completedTasks: overallCompletedTasks,
        completionPercentage: overallCompletionPercentage,
      },
    };
  }

  async getById(id) {
    const result = await prisma.coupleTimelineSection.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!result) {
      throw new AppError('Data not found', 404);
    }
    return result;
  }

  async update(id, data) {
    await this.getById(id);
    const result = await prisma.coupleTimelineSection.update({
      where: { id },
      data: {
        order: data.order,
        note: data.note,
      },
    });

    return result;
  }

  async updateTask(id, data) {
    const existingTask = await prisma.coupleTimelineTask.findUnique({
      where: { id },
    });
    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }
    const result = await prisma.coupleTimelineTask.update({
      where: { id },
      data: {
        isCompleted: data.isCompleted,
      },
    });
    return result;
  }

  async delete(id) {
    await this.getById(id);

    await prisma.coupleTimelineSection.delete({
      where: { id },
    });

    return true;
  }

  async deleteTask(id) {
    const existingTask = await prisma.coupleTimelineTask.findUnique({
      where: { id },
    });
    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }
    await prisma.coupleTimelineTask.delete({
      where: { id },
    });
    return true;
  }
}

module.exports = CoupleTimelineService;
