// create-vendor-package.dto.js
class CreateVendorPackageDto {
  constructor(data = {}) {
    this.vendorId = data.vendorId;
    this.packageName = data.packageName;
    this.price = data.price !== undefined ? parseFloat(data.price) : undefined;
    this.badge = data.badge || null;
    this.shortDescription = data.shortDescription || null;
    this.features = data.features;
  }
}

// update-vendor-package.dto.js
class UpdateVendorPackageDto {
  constructor(data = {}) {
    if (data.packageName !== undefined) this.packageName = data.packageName;
    if (data.price !== undefined) this.price = parseFloat(data.price);
    if (data.badge !== undefined) this.badge = data.badge || null;
    if (data.shortDescription !== undefined)
      this.shortDescription = data.shortDescription || null;
    if (data.features !== undefined) this.features = data.features;
  }
}

module.exports = {
  CreateVendorPackageDto,
  UpdateVendorPackageDto,
};
