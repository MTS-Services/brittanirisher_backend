const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class CoupleExpenseService {
  async create(data, coupleProfileId) {
    const isCategoryValid = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!isCategoryValid) {
      throw new AppError('Invalid category ID', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const amount = parseFloat(data.amount);

      await tx.coupleProfile.update({
        where: { id: coupleProfileId },
        data: {
          expendBudget: { increment: amount },
        },
      });

      const expense = await tx.coupleExpense.create({
        data: {
          vendorName: data.vendorName,
          categoryId: data.categoryId,
          vendorPhone: data.vendorPhone,
          vendorEmail: data.vendorEmail,
          amount,
          note: data.note,
          coupleProfileId,
        },
      });
      return expense;
    });
    return result;
  }

  async getAll(coupleProfileId) {
    return prisma.coupleExpense.findMany({
      where: { coupleProfileId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id) {
    const result = await prisma.coupleExpense.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!result) {
      throw new AppError('Expense not found', 404);
    }

    return result;
  }

  async update(id, data) {
    const existingExpense = await this.getById(id);

    if (!existingExpense) {
      throw new AppError('Expense not found', 404);
    }

    if (data.categoryId) {
      const isCategoryValid = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!isCategoryValid) {
        throw new AppError('Invalid category ID', 400);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.amount !== undefined) {
        const amountDifference = data.amount - existingExpense.amount;
        await tx.coupleProfile.update({
          where: { id: existingExpense.coupleProfileId },
          data: {
            expendBudget: { increment: amountDifference },
          },
        });
      }

      const updatedExpense = await tx.coupleExpense.update({
        where: { id },
        data: {
          ...data,
        },
      });
      return updatedExpense;
    });

    return result;
  }

  async delete(id) {
    const result = await this.getById(id);

    const amount = result.amount;
    await prisma.coupleProfile.update({
      where: { id: result.coupleProfileId },
      data: {
        expendBudget: { decrement: amount },
      },
    });

    await prisma.coupleExpense.delete({
      where: { id },
    });
    return true;
  }
}

module.exports = CoupleExpenseService;
