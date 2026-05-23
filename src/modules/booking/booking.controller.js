const { asyncHandler, AppError } = require('../../middlewares/errorHandler');
const {
  CreateBookingDTO,
  FilterBookingDTO,
  UpdateBookingDTO,
} = require('./booking.dto');
const BookingService = require('./booking.services');

class BookingController {
  constructor() {
    this.bookingService = new BookingService();
  }

  ensureVendorAccess(req, booking) {
    if (req.user.role !== 'VENDOR') {
      return;
    }

    if (!req.user.vendorProfileId) {
      throw new AppError('Vendor profile not found for current user', 403);
    }

    if (booking && booking.vendorId !== req.user.vendorProfileId) {
      throw new AppError('Access denied for this booking', 403);
    }
  }

  createBooking = asyncHandler(async (req, res) => {
    const dto = new CreateBookingDTO(req.body);
    const vendorId = req.user?.vendorProfileId;
    if (!vendorId) {
      throw new AppError('Vendor profile not found for current user', 403);
    }
    dto.vendorId = vendorId;
    const result = await this.bookingService.createBooking(dto);
    res.sendCreated(result, 'Booking created successfully');
  });

  getBookings = asyncHandler(async (req, res) => {
    const filterDTO = new FilterBookingDTO(req.query);

    if (req.user.role === 'VENDOR') {
      this.ensureVendorAccess(req);
      filterDTO.vendorId = req.user.vendorProfileId;
    }

    const result = await this.bookingService.getBookings(filterDTO);
    res.sendSuccess(
      result.data,
      'Bookings retrieved successfully',
      result.pagination,
    );
  });

  getBookingById = asyncHandler(async (req, res) => {
    const result = await this.bookingService.getBookingById(req.params.id);
    this.ensureVendorAccess(req, result);
    res.sendSuccess(result, 'Booking retrieved successfully');
  });

  updateBooking = asyncHandler(async (req, res) => {
    const existingBooking = await this.bookingService.getBookingById(
      req.params.id,
    );
    this.ensureVendorAccess(req, existingBooking);

    const dto = new UpdateBookingDTO(req.body);
    const result = await this.bookingService.updateBooking(req.params.id, dto);

    res.sendSuccess(result, 'Booking updated successfully');
  });

  deleteBooking = asyncHandler(async (req, res) => {
    const existingBooking = await this.bookingService.getBookingById(
      req.params.id,
    );
    this.ensureVendorAccess(req, existingBooking);

    await this.bookingService.deleteBooking(req.params.id);
    res.sendSuccess(null, 'Booking deleted successfully');
  });
}

module.exports = BookingController;
