class CreateVendorAvailabilityDTO {
  constructor(data = {}) {
    this.vendorId = data.vendorId;
    this.blockedDate = data.blockedDate
      ? new Date(data.blockedDate)
      : undefined;
    this.status = data.status;
  }
}

class UpdateVendorAvailabilityDTO {
  constructor(data = {}) {
    if (data.blockedDate !== undefined) {
      this.blockedDate = data.blockedDate
        ? new Date(data.blockedDate)
        : undefined;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
  }
}

class FilterVendorAvailabilityDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page, 10) || 1;
    this.limit = parseInt(query.limit, 10) || 10;
    this.sortBy = query.sortBy || 'blockedDate';
    this.sortOrder = query.sortOrder || 'asc';
    this.search = query.search;
    this.vendorId = query.vendorId;
    this.status = query.status;
    this.fromDate = query.fromDate;
    this.toDate = query.toDate;
  }

  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class SetMonthlyAvailabilityDTO {
  constructor(data = {}) {
    this.vendorId = data.vendorId;
    this.year = Number(data.year);
    this.month = Number(data.month);
    this.days = Array.isArray(data.days)
      ? data.days.map((day) => ({
          blockedDate: new Date(day.blockedDate),
          status: day.status,
        }))
      : [];
  }
}

module.exports = {
  CreateVendorAvailabilityDTO,
  UpdateVendorAvailabilityDTO,
  FilterVendorAvailabilityDTO,
  SetMonthlyAvailabilityDTO,
};
