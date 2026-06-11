const cron = require('node-cron');
const { prisma } = require('../config/database');

const initSubscriptionCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log(
      '[Cron Automation]: Executing expiration checks for subscriptions...',
    );

    try {
      const now = new Date();

      const expiredSubscriptions = await prisma.vendorSubscription.findMany({
        where: {
          status: 'ACTIVE',
          endsAt: {
            lt: now,
          },
        },
        select: {
          id: true,
          plan: true,
        },
      });

      if (expiredSubscriptions.length === 0) {
        console.log('[Cron Automation]: No expired subscriptions found today.');
        return;
      }

      // const filterStaterPlans = expiredSubscriptions.filter(
      //   (sub) => sub.plan.priceMonthly === 0,
      // );

      const expiredIds = expiredSubscriptions.map((sub) => sub.id);

      await prisma.$transaction([
        prisma.vendorSubscription.updateMany({
          where: {
            id: { in: expiredIds },
          },
          data: {
            status: 'EXPIRED',
          },
        }),
      ]);

      // if (filterStaterPlans.length > 0) {
      //   const filterStaterPlanIds = filterStaterPlans.map((sub) => sub.id);
      //   await prisma.vendorSubscription.updateMany({
      //     where: {
      //       id: { in: filterStaterPlanIds },
      //     },
      //     data: {
      //       startsAt: date.now(),
      //       endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      //       status: 'ACTIVE',
      //     },
      //   });
      // }

      console.log(
        `[Cron Automation]: Successfully expired ${expiredIds.length} subscriptions and cleared profile linkages.`,
      );
    } catch (error) {
      console.error(
        '[Cron Automation Error]: Failed processing scheduled updates:',
        error.message,
      );
    }
  });
};

module.exports = initSubscriptionCron;
