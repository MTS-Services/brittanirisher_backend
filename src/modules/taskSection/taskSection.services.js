const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class TaskSectionService {
  async create(data, coupleProfileId) {
    const result = await prisma.taskSection.create({
      data: {
        title: data.title,
        coupleProfileId,
        order: 0,
        tasks: {
          create: data.tasks.map((task, index) => ({
            taskName: task,
            milestoneTitle: data.title,
          })),
        },
      },
    });
    return result;
  }

  async getAll(coupleProfileId) {
    return prisma.taskSection.findMany({
      where: { coupleProfileId },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id) {
    const result = await prisma.taskSection.findUnique({
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
    const result = await prisma.$transaction(async (tx) => {
      const updatedSection = await tx.taskSection.update({
        where: { id },
        data: {
          title: data.title,
        },
      });

      if (data.tasks) {
        await tx.coupleTask.deleteMany({
          where: { taskSectionId: id },
        });
        const newTasks = data.tasks.map((task) => ({
          taskName: task,
          milestoneTitle: data.title,
          taskSectionId: id,
        }));
        await tx.coupleTask.createMany({
          data: newTasks,
        });
      }
      const expense = await tx.taskSection.findUnique({
        where: { id },
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      return expense;
    });

    return result;
  }

  async updateTask(id, data) {
    const existingTask = await prisma.coupleTask.findUnique({
      where: { id },
    });
    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }
    const result = await prisma.coupleTask.update({
      where: { id },
      data: {
        taskName: data.taskName,
        isCompleted: data.isCompleted,
      },
    });
    return result;
  }

  async delete(id) {
    await this.getById(id);

    await prisma.taskSection.delete({
      where: { id },
    });

    return true;
  }

  async deleteTask(id) {
    const existingTask = await prisma.coupleTask.findUnique({
      where: { id },
    });
    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }
    await prisma.coupleTask.delete({
      where: { id },
    });
    return true;
  }
}

module.exports = TaskSectionService;
