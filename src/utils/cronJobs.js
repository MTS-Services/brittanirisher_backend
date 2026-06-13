const cron = require('node-cron');
const { prisma } = require('../config/database');

const initSubscriptionAndBookingCron = () => {
  // Schedule to run every single day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log(
      '[Cron Automation]: Executing scheduled expiration and completion checks...',
    );

    try {
      const now = new Date();
      const operations = [];

      // ==========================================
      // PHASE 1: PROCESS EXPIRED SUBSCRIPTIONS
      // ==========================================
      const expiredSubscriptions = await prisma.vendorSubscription.findMany({
        where: {
          status: 'ACTIVE',
          endsAt: { lt: now },
        },
        select: { id: true },
      });

      if (expiredSubscriptions.length > 0) {
        const expiredIds = expiredSubscriptions.map((sub) => sub.id);

        // Push subscription update operation into transaction pipeline array
        operations.push(
          prisma.vendorSubscription.updateMany({
            where: { id: { in: expiredIds } },
            data: { status: 'EXPIRED' },
          }),
        );
        console.log(
          `[Cron Automation]: Found ${expiredIds.length} subscriptions to expire.`,
        );
      }

      // ==========================================
      // PHASE 2: PROCESS COMPLETED WEDDING BOOKINGS
      // ==========================================
      // Target bookings that are past their wedding date but haven't been closed/completed yet
      const pastBookings = await prisma.vendorBooking.findMany({
        where: {
          status: { in: ['BOOKED', 'PENDING'] },
          weddingDate: { lt: now }, // Wedding date is in the past
        },
        select: { id: true },
      });

      if (pastBookings.length > 0) {
        const bookingIds = pastBookings.map((booking) => booking.id);

        // Push booking status transition update operation into transaction pipeline array
        operations.push(
          prisma.vendorBooking.updateMany({
            where: { id: { in: bookingIds } },
            data: { status: 'COMPLETED' },
          }),
        );
        console.log(
          `[Cron Automation]: Found ${bookingIds.length} past bookings to mark as COMPLETED.`,
        );
      }

      // ==========================================
      // PHASE 3: ATOMIC TRANSACTION EXECUTION
      // ==========================================
      if (operations.length > 0) {
        // Execute updates altogether inside a safe atomic database context transaction
        await prisma.$transaction(operations);
        console.log('[Cron Automation]: Database sync completed successfully.');
      } else {
        console.log(
          '[Cron Automation]: No expired subscriptions or pending past bookings discovered today.',
        );
      }
    } catch (error) {
      console.error(
        '[Cron Automation Error]: Failed processing scheduled updates:',
        error.message,
      );
    }
  });
};

module.exports = initSubscriptionAndBookingCron;
