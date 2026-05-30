const { prisma } = require('../../config/database');

class DashboardService {
  async getVendorDashboardData(vendorId) {
    // Use Promise.all to fetch independent database queries concurrently, reducing execution time
    const [
      totalBookings,
      upcomingBookings,
      resentEnquiry,
      newLeedsEnquiry,
      lastSubscription,
    ] = await Promise.all([
      prisma.vendorBooking.count({
        where: { vendorId },
      }),

      prisma.vendorBooking.findMany({
        where: {
          vendorId,
          weddingDate: { gte: new Date() },
        },
        orderBy: { weddingDate: 'asc' },
        take: 2, // Prisma uses 'take' instead of 'limit'
      }),

      prisma.enquiry.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'desc' },
        take: 2, // Prisma uses 'take' instead of 'limit'
      }),

      prisma.enquiry.count({
        where: {
          vendorId,
          status: 'NEW',
        },
      }),

      prisma.vendorSubscription.findFirst({
        where: { vendorId },
        include: {
          plan: {
            select: {
              id: true,
              planName: true,
              sortDescription: true,
              priceMonthly: true,
              portfolioLimit: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Initialize the response structure for the UI card
    let upcomingWeddingCard = {
      title: 'Upcoming Wedding Program',
      daysRemaining: null,
    };

    // Calculate days remaining if an upcoming booking exists
    if (upcomingBookings.length > 0) {
      const nextWeddingDate = new Date(upcomingBookings[0].weddingDate);
      const today = new Date();

      // Reset hours to get an accurate daily difference regardless of time-of-day
      nextWeddingDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const timeDiff = nextWeddingDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      upcomingWeddingCard.daysRemaining =
        daysRemaining >= 0 ? daysRemaining : 0;
    }

    return {
      lastSubscription,
      totalBookings,
      upcomingWeddingCard: upcomingWeddingCard.daysRemaining,
      newLeedsEnquiry,
      upcomingBookings,
      resentEnquiry,
    };
  }

  async getLeadVendorAnalytics(vendorId, filter = 'this_year') {
    const today = new Date();
    let targetYear = today.getFullYear();

    if (filter === 'previous_year') {
      targetYear -= 1;
    }

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const enquiries = await prisma.enquiry.findMany({
      where: {
        vendorId,
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'July',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const monthlyDataMap = monthNames.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    enquiries.forEach((enquiry) => {
      const monthIndex = new Date(enquiry.createdAt).getMonth();
      const monthName = monthNames[monthIndex];
      monthlyDataMap[monthName] += 1;
    });

    const chartData = monthNames.map((month) => ({
      month,
      leads: monthlyDataMap[month],
    }));

    return chartData;
  }

  async getAdminDashboardCardData() {
    const [totalVendors, totalCouples, totalBookings] = await Promise.all([
      prisma.vendorProfile.count(),
      prisma.coupleProfile.count(),
      prisma.vendorBooking.count(),
    ]);

    // const monthlyRevenueData = await prisma.payment.groupBy({
    //   by: ['month'],
    //   where: {
    //     purchaseDate: {
    //       gte: new Date(new Date().getFullYear(), 0, 1),
    //       lte: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999),
    //     },
    //   },
    //   _sum: {
    //     amount: true,
    //   },
    // });

    const thisMonthRevenueData = await prisma.payment.aggregate({
      where: {
        purchaseDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      totalVendors,
      totalCouples,
      totalBookings,
      thisMonthRevenueData: thisMonthRevenueData._sum.amount || 0,
    };
  }

  async getAdminChart(filter = 'this_year') {
    const today = new Date();
    let targetYear = today.getFullYear();

    if (filter === 'previous_year') {
      targetYear -= 1;
    }

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const paymentsGrouped = await prisma.payment.groupBy({
      by: ['purchaseDate'],
      where: {
        status: 'SUCCESS',
        purchaseDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyDataMap = monthNames.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    paymentsGrouped.forEach((group) => {
      if (group.purchaseDate) {
        const monthIndex = group.purchaseDate.getMonth();
        const monthName = monthNames[monthIndex];
        monthlyDataMap[monthName] += group._sum.amount || 0;
      }
    });

    const chartData = monthNames.map((month) => ({
      month,
      revenue: Math.round(monthlyDataMap[month]),
    }));

    return chartData;
  }
}

module.exports = DashboardService;
