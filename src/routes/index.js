/**
 * Main API routes index
 * Consolidates all module routes under /api/v1
 */
const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const jobRoutes = require('../modules/job/job.route');
const uploadRoutes = require('../modules/upload/upload.route');
const categoryRoutes = require('../modules/category/category.route');
const weddingStyleRoutes = require('../modules/weddingStyle/weddingStyle.route');
const subscriptionPlanRoutes = require('../modules/subscriptionPlan/subscriptionPlan.route');
const vendorProfileRoutes = require('../modules/vendorProfile/vendorProfile.route');
const enquiryRoutes = require('../modules/enquiry/enquiry.route');
const bookingRoutes = require('../modules/booking/booking.route');
const vendorAvailabilityRoutes = require('../modules/vendorAvailability/vendorAvailability.route');
const vendorPackageRoutes = require('../modules/vendorPackage/vendorPackage.route');
const coupleProfileRoutes = require('../modules/coupleProfile/coupleProfile.route');
const coupleExpenseRoutes = require('../modules/coupleExpense/coupleExpense.route');
const coupleTaskRoutes = require('../modules/taskSection/taskSection.route');
const coupleWeddingScheduleRoutes = require('../modules/weddingDaySchedule/weddingDaySchedule.route');
const saveVendorRoutes = require('../modules/saveVendor/saveVendor.route');
const paymentRoutes = require('../modules/payment/payment.route');
const DashboardRoutes = require('../modules/dashboard/dashboard.route');
const timelineRoutes = require('../modules/coupleTimeline/coupleTimeline.route');
const statesRoutes = require('../modules/states/states.route');
const cityRoutes = require('../modules/city/city.route');
const apiDocsHandler = require('../modules/docs/apiDocsHandler');

router.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected',
      api: 'running',
    },
  };

  res.sendSuccess(healthData, 'API is running healthy');
});

// API documentation endpoint
router.get('/docs', apiDocsHandler);

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/job', jobRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/wedding-styles', weddingStyleRoutes);
router.use('/subscription-plans', subscriptionPlanRoutes);
router.use('/vendor-profiles', vendorProfileRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/vendor-availabilities', vendorAvailabilityRoutes);
router.use('/vendor-package', vendorPackageRoutes);
router.use('/couple-profiles', coupleProfileRoutes);
router.use('/couple-expense', coupleExpenseRoutes);
router.use('/couple-checklist', coupleTaskRoutes);
router.use('/couple-day-schedule', coupleWeddingScheduleRoutes);
router.use('/save-vendor', saveVendorRoutes);
// router.use('/payment', paymentRoutes);
router.use('/dashboard', DashboardRoutes);
router.use('/couple-timeline', timelineRoutes);
router.use('/state', statesRoutes);
router.use('/city', cityRoutes);
module.exports = router;
