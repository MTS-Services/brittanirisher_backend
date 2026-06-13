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
      totalRevenue,
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

      prisma.vendorBooking.aggregate({
        where: {
          vendorId,
        },
        _sum: {
          price: true,
        },
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
      totalRevenue: totalRevenue._sum.price || 0,
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

  async getAdminPaymentCartData() {
    const today = new Date();

    // 1. Boundary configurations for "This Month"
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // 2. Boundary configurations for "This Year"
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Execute multi-layered calculations concurrently for optimum processing speed
    const [
      totalRevenueAggregate,
      thisMonthRevenueAggregate,
      thisYearRevenueAggregate,
      activePlansCount,
      expiredPlansCount,
    ] = await Promise.all([
      // A. TOTAL REVENUE: Sum of all historically successful payments
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),

      // B. THIS MONTH REVENUE: Sum of successful transactions within the current month block
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          purchaseDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      }),

      // C. ANNUAL (THIS YEAR) REVENUE: Sum of successful transactions within the current year block
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          purchaseDate: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        _sum: { amount: true },
      }),

      // D. ACTIVE PLANS: Dynamic count of vendors with an active ongoing plan that hasn't run out
      prisma.vendorProfile.count({
        where: {
          currentSubscription: {
            status: 'ACTIVE',
            endsAt: { gte: today },
          },
        },
      }),

      // E. EXPIRED PLANS: Vendor accounts where subscriptions are set to EXPIRED, INACTIVE, or are past their due date
      prisma.vendorProfile.count({
        where: {
          OR: [
            { currentSubscription: null }, // Registered fallback without active packages
            {
              currentSubscription: {
                OR: [{ status: 'EXPIRED' }, { endsAt: { lt: today } }],
              },
            },
          ],
        },
      }),
    ]);

    return {
      totalRevenue: totalRevenueAggregate._sum.amount || 0,
      thisMonthRevenue: thisMonthRevenueAggregate._sum.amount || 0,
      thisYearRevenue: thisYearRevenueAggregate._sum.amount || 0,
      activePlansCount,
      expiredPlansCount,
    };
  }

  async getResentSubscriptionPlans(filterDTO) {
    const { page, limit } = filterDTO;

    const offset = filterDTO.getOffset();

    const [purchases, totalRecords] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
        },
        include: {
          vendor: {
            select: {
              businessName: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          subscription: {
            select: {
              endsAt: true,
              plan: {
                select: {
                  planName: true,
                },
              },
            },
          },
        },
        orderBy: {
          purchaseDate: 'desc',
        },
        skip: offset,
        take: limit,
      }),

      // Get count of all successful payments to compute total pages
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
    ]);

    // 3. Flatten the relational database structure into neat, easily readable objects for the frontend
    const formattedTableData = purchases.map((item) => ({
      id: item.id,
      vendorName: item.vendor?.user?.name || 'Unknown',
      businessName: item.vendor?.businessName || 'N/A',
      plan: item.subscription?.plan?.name || 'Custom Plan',
      price: item.amount,
      purchaseDate: item.purchaseDate,
      expiryDate: item.subscription?.endsAt || null,
    }));

    return {
      data: formattedTableData,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: totalRecords,
        totalPages: Math.ceil(totalRecords / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(totalRecords / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  async getVendorAnalyticChart(vendorId, filter = 'this_year') {
    const today = new Date();
    let targetYear = today.getFullYear();

    if (filter === 'previous_year') {
      targetYear -= 1;
    }

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

    const paymentsGrouped = await prisma.vendorBooking.groupBy({
      by: ['createdAt'],
      where: {
        vendorId: vendorId,
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _sum: {
        price: true,
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
      if (group.createdAt) {
        const monthIndex = group.createdAt.getMonth();
        const monthName = monthNames[monthIndex];
        monthlyDataMap[monthName] += group._sum.price || 0;
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
