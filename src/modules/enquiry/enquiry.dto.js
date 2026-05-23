class CreateEnquiryDTO {
  constructor(data = {}) {
    this.vendorId = data.vendorId;
    this.profileId = data.profileId || null;
    this.senderName = data.senderName?.trim();
    this.senderPhone = data.senderPhone?.trim();
    this.senderEmail = data.senderEmail?.trim()?.toLowerCase();
    this.message = data.message?.trim();
    this.status = data.status;
  }
}

class FilterEnquiryDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page, 10) || 1;
    this.limit = parseInt(query.limit, 10) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.status = query.status;
    this.vendorId = query.vendorId;
    this.profileId = query.profileId;
  }

  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

class UpdateEnquiryDTO {
  constructor(data = {}) {
    if (data.vendorId !== undefined) this.vendorId = data.vendorId;
    if (data.profileId !== undefined) this.profileId = data.profileId;
    if (data.senderName !== undefined)
      this.senderName = data.senderName?.trim();
    if (data.senderPhone !== undefined) {
      this.senderPhone = data.senderPhone?.trim();
    }
    if (data.senderEmail !== undefined) {
      this.senderEmail = data.senderEmail?.trim()?.toLowerCase();
    }
    if (data.message !== undefined) this.message = data.message?.trim();
    if (data.status !== undefined) this.status = data.status;
  }
}

module.exports = {
  CreateEnquiryDTO,
  FilterEnquiryDTO,
  UpdateEnquiryDTO,
};
