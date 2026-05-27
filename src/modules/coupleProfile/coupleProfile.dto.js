class filterCoupleDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.locationSearch = query.locationSearch;
    this.category = query.category;
    this.availableDate = query.availableDate;
    this.minPrice =
      query.minPrice !== undefined ? Number(query.minPrice) : undefined;
    this.maxPrice =
      query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

module.exports = {
  filterCoupleDTO,
};
