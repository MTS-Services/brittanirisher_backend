const { asyncHandler } = require('../../middlewares/errorHandler');
const DashboardService = require('./dashboard.services');

class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getVendorDashboardData = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorProfileId;
    if (!vendorId) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    // const filter = req.query.filter || 'current_year';
    const result = await this.dashboardService.getVendorDashboardData(vendorId);
    res.sendSuccess(result, 'Dashboard data retrieved successfully');
  });

  getLeadVendorAnalytics = asyncHandler(async (req, res) => {
    const vendorId = req.user.vendorProfileId;
    if (!vendorId) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    const filter = req.query.filter || 'this_year';
    const result = await this.dashboardService.getLeadVendorAnalytics(
      vendorId,
      filter,
    );
    res.sendSuccess(result, 'Dashboard data retrieved successfully');
  });

  getAdminCard = asyncHandler(async (req, res) => {
    const result = await this.dashboardService.getAdminDashboardCardData();
    res.sendSuccess(result, 'Dashboard data retrieved successfully');
  });

  getAdminChart = asyncHandler(async (req, res) => {
    const filter = req.query.filter || 'this_year';
    const result = await this.dashboardService.getAdminChart(filter);
    res.sendSuccess(result, 'Dashboard data retrieved successfully');
  });
}

module.exports = DashboardController;
