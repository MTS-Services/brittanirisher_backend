class CreateBookingDTO {
  constructor(data = {}) {
    this.vendorId = data.vendorId;
    this.coupleName = data.coupleName?.trim();
    this.email = data.email?.trim()?.toLowerCase();
    this.phone = data.phone?.trim();
    this.venueName = data.venueName?.trim();
    this.location = data.location?.trim();
    this.weddingDate = data.weddingDate
      ? new Date(data.weddingDate)
      : undefined;
    this.price = data.price;
    this.packageId = data.packageId;
    this.status = data.status;
  }
}

class FilterBookingDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page, 10) || 1;
    this.limit = parseInt(query.limit, 10) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.status = query.status;
    this.vendorId = query.vendorId;
    this.packageId = query.packageId;
    this.fromDate = query.fromDate;
    this.toDate = query.toDate;
  }

  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class UpdateBookingDTO {
  constructor(data = {}) {
    if (data.vendorId !== undefined) this.vendorId = data.vendorId;
    if (data.coupleName !== undefined)
      this.coupleName = data.coupleName?.trim();
    if (data.email !== undefined)
      this.email = data.email?.trim()?.toLowerCase();
    if (data.phone !== undefined) this.phone = data.phone?.trim();
    if (data.venueName !== undefined) this.venueName = data.venueName?.trim();
    if (data.location !== undefined) this.location = data.location?.trim();
    if (data.weddingDate !== undefined) {
      this.weddingDate = data.weddingDate ? new Date(data.weddingDate) : null;
    }
    if (data.price !== undefined) this.price = data.price;
    if (data.packageId !== undefined) this.packageId = data.packageId;
    if (data.status !== undefined) this.status = data.status;
  }
}

module.exports = {
  CreateBookingDTO,
  FilterBookingDTO,
  UpdateBookingDTO,
};
