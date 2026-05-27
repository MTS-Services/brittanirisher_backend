const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class WeddingScheduleService {
  async create(data, coupleProfileId) {
    const coupleExists = await prisma.coupleProfile.findUnique({
      where: { id: coupleProfileId },
    });
    if (!coupleExists) {
      throw new AppError('Couple profile not found', 404);
    }

    return await prisma.weddingDaySchedule.create({
      data: {
        ...data,
        coupleProfileId,
      },
    });
  }

  async getByCoupleId(coupleProfileId) {
    return await prisma.weddingDaySchedule.findMany({
      where: { coupleProfileId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getById(id) {
    const schedule = await prisma.weddingDaySchedule.findUnique({
      where: { id },
    });
    if (!schedule) {
      throw new AppError('Schedule event not found', 404);
    }
    return schedule;
  }

  async update(id, data) {
    await this.getById(id);

    return await prisma.weddingDaySchedule.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async delete(id) {
    await this.getById(id);

    await prisma.weddingDaySchedule.delete({
      where: { id },
    });
    return { message: 'Schedule event deleted successfully' };
  }
}

module.exports = WeddingScheduleService;
