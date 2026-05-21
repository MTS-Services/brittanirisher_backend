const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class SubscriptionPlanService {
  async createSubscriptionPlan(data) {
    return prisma.subscriptionPlan.create({
      data: {
        planName: data.planName.trim(),
        priceMonthly: data.priceMonthly,
        portfolioLimit: data.portfolioLimit,
        featuresAllowed: data.featuresAllowed,
        sortDescription: data.sortDescription.trim(),
      },
    });
  }

  async getSubscriptionPlans() {
    return prisma.subscriptionPlan.findMany({
      orderBy: { planName: 'asc' },
    });
  }

  async getSubscriptionPlanById(id) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new AppError('Subscription plan not found', 404);
    }

    return plan;
  }

  async updateSubscriptionPlan(id, data) {
    await this.getSubscriptionPlanById(id);

    const updateData = {
      ...(data.planName !== undefined
        ? { planName: data.planName.trim() }
        : {}),
      ...(data.priceMonthly !== undefined
        ? { priceMonthly: data.priceMonthly }
        : {}),
      ...(data.portfolioLimit !== undefined
        ? { portfolioLimit: data.portfolioLimit }
        : {}),
      ...(data.featuresAllowed !== undefined
        ? { featuresAllowed: data.featuresAllowed }
        : {}),
      ...(data.sortDescription !== undefined
        ? { sortDescription: data.sortDescription.trim() }
        : {}),
    };

    return prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteSubscriptionPlan(id) {
    await this.getSubscriptionPlanById(id);

    await prisma.subscriptionPlan.delete({
      where: { id },
    });

    return true;
  }
}

module.exports = SubscriptionPlanService;
