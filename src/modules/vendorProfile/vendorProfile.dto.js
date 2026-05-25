// class CreateVendorProfileDTO {
//   constructor(data) {
//     this.businessName = data.businessName;
//     this.location = data.location;
//     this.categoryId = data.categoryId;
//     this.experienceYears = data.experienceYears;
//     this.speciality = data.speciality;
//     this.aboutMe = data.aboutMe;
//     this.coverImage = data.coverImage;
//   }

//   toDatabase() {
//     return {
//       businessName: this.businessName,
//       location: this.location,
//       categoryId: this.categoryId,
//       experienceYears: this.experienceYears,
//       speciality: this.speciality,
//       aboutMe: this.aboutMe,
//       coverImage: this.coverImage,
//     };
//   }
// }

class CreateVendorProfileDTO {
  constructor(data) {
    this.name = data.name?.trim();
    this.email = data.email?.trim()?.toLowerCase();
    this.password = data.password;
    this.role = 'VENDOR';
    this.businessName = data.businessName?.trim();
    this.location = data.location?.trim();
    this.experienceYears = data.experienceYears?.trim() || null;
    this.speciality = data.speciality?.trim() || null;
    this.aboutMe = data.aboutMe?.trim() || null;
    this.coverImage = data.coverImage || null;
    this.highlightedServices = Array.isArray(data.highlightedServices);
    this.categoryId = data.categoryId;
    this.packageId = data.packageId || null;

    this.packages = Array.isArray(data.package)
      ? data.package.map((pkg) => ({
          packageName: pkg.packageName?.trim(),
          price: parseFloat(pkg.price),
          badge: pkg.badge?.trim() || null,
          isActive: pkg.isActive !== undefined ? pkg.isActive : true,
          features: Array.isArray(pkg.features)
            ? pkg.features.map((f) => f.trim())
            : [],
        }))
      : [];
  }

  toDatabase() {
    return {
      businessName: this.businessName,
      location: this.location,
      experienceYears: this.experienceYears,
      speciality: this.speciality,
      aboutMe: this.aboutMe,
      coverImage: this.coverImage,
    };
  }
}

class filterVendorDTO {
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

class UpdateVendorProfileDTO {
  constructor(data = {}) {
    if (data.name !== undefined)
      this.name = data.name ? data.name.trim() : null;
    if (data.email !== undefined)
      this.email = data.email ? data.email.trim() : null;
    if (data.phone !== undefined)
      this.phone = data.phone ? data.phone.trim() : null;
    if (data.location !== undefined)
      this.location = data.location ? data.location.trim() : null;
    if (data.businessName !== undefined)
      this.businessName = data.businessName ? data.businessName.trim() : null;
    if (data.experienceYears !== undefined)
      this.experienceYears = data.experienceYears
        ? data.experienceYears.trim()
        : null;
    if (data.speciality !== undefined)
      this.speciality = data.speciality ? data.speciality.trim() : null;

    if (data.highlightedServices !== undefined) {
      this.highlightedServices = Array.isArray(data.highlightedServices)
        ? data.highlightedServices.map((service) => service.trim())
        : [];
    }

    if (data.aboutMe !== undefined)
      this.aboutMe = data.aboutMe ? data.aboutMe.trim() : null;
  }

  toDatabase() {
    const dbData = {};
    Object.keys(this).forEach((key) => {
      if (this[key] !== undefined) {
        dbData[key] = this[key];
      }
    });

    return dbData;
  }
}

class VendorProfileResponseDTO {
  constructor(profile) {
    this.id = profile.id;
    this.userId = profile.userId;
    this.businessName = profile.businessName;
    this.location = profile.location;
    this.categoryId = profile.categoryId;
    this.experienceYears = profile.experienceYears;
    this.speciality = profile.speciality;
    this.aboutMe = profile.aboutMe;
    this.coverImage = profile.coverImage;
    this.isVerified = profile.isVerified;
    this.createdAt = profile.createdAt;
    this.updatedAt = profile.updatedAt;
  }
}

module.exports = {
  CreateVendorProfileDTO,
  UpdateVendorProfileDTO,
  VendorProfileResponseDTO,
  filterVendorDTO,
};
