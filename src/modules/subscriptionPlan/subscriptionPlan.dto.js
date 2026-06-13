class CreateSubscriptionPlanDTO {
  constructor(data) {
    this.planName = data.planName;
    this.sortDescription = data.sortDescription;
    this.priceMonthly = data.priceMonthly;
    this.portfolioLimit = data.portfolioLimit;
    this.featuresAllowed = data.featuresAllowed;
    this.validFor = data.validFor;
  }

  toDatabase() {
    return {
      planName: this.planName,
      sortDescription: this.sortDescription,
      priceMonthly: this.priceMonthly,
      portfolioLimit: this.portfolioLimit,
      featuresAllowed: this.featuresAllowed,
      validFor: this.validFor,
    };
  }
}

class UpdateSubscriptionPlanDTO {
  constructor(data) {
    this.planName = data.planName;
    this.sortDescription = data.sortDescription;
    this.priceMonthly = data.priceMonthly;
    this.portfolioLimit = data.portfolioLimit;
    this.featuresAllowed = data.featuresAllowed;
    this.validFor = data.validFor;
    this.badge = data.badge;
    this.isAnalyticShow = data.isAnalyticShow;
    this.isSocialShow = data.isSocialShow;
  }

  toDatabase() {
    const updateData = {};

    if (this.planName !== undefined) updateData.planName = this.planName;
    if (this.sortDescription !== undefined)
      updateData.sortDescription = this.sortDescription;
    if (this.priceMonthly !== undefined)
      updateData.priceMonthly = this.priceMonthly;
    if (this.portfolioLimit !== undefined)
      updateData.portfolioLimit = this.portfolioLimit;
    if (this.featuresAllowed !== undefined)
      updateData.featuresAllowed = this.featuresAllowed;
    if (this.validFor !== undefined) updateData.validFor = this.validFor;
    if (this.badge !== undefined) updateData.badge = this.badge;
    if (this.isAnalyticShow !== undefined)
      updateData.isAnalyticShow = this.isAnalyticShow;
    if (this.isSocialShow !== undefined)
      updateData.isSocialShow = this.isSocialShow;

    return updateData;
  }
}

module.exports = {
  CreateSubscriptionPlanDTO,
  UpdateSubscriptionPlanDTO,
};
