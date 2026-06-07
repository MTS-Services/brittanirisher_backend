const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class MessageService {
  async create(data) {
    return prisma.message.create({
      data: {
        ...data,
      },
    });
  }

  async getAll(filterDTO) {
    const { page, limit } = filterDTO;
    const skipItems = filterDTO.getOffset();
    const total = await prisma.message.count();
    const result = await prisma.message.findMany({
      take: limit,
      skip: skipItems,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: result,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async getById(id) {
    const category = await prisma.message.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Message not found', 404);
    }

    return category;
  }

  async delete(id) {
    await this.getById(id);

    await prisma.message.delete({
      where: { id },
    });

    return true;
  }
}

module.exports = MessageService;
