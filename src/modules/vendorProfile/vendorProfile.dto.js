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
  constructor(data) {
    this.businessName = data.businessName;
    this.location = data.location;
    this.categoryId = data.categoryId;
    this.experienceYears = data.experienceYears;
    this.speciality = data.speciality;
    this.aboutMe = data.aboutMe;
    this.coverImage = data.coverImage;
    this.isVerified = data.isVerified;
  }

  toDatabase() {
    const updateData = {};

    if (this.businessName !== undefined)
      updateData.businessName = this.businessName;
    if (this.location !== undefined) updateData.location = this.location;
    if (this.categoryId !== undefined) updateData.categoryId = this.categoryId;
    if (this.experienceYears !== undefined)
      updateData.experienceYears = this.experienceYears;
    if (this.speciality !== undefined) updateData.speciality = this.speciality;
    if (this.aboutMe !== undefined) updateData.aboutMe = this.aboutMe;
    if (this.coverImage !== undefined) updateData.coverImage = this.coverImage;
    if (this.isVerified !== undefined) updateData.isVerified = this.isVerified;

    return updateData;
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
