export class CreateJobDTO {
  constructor(data) {
    this.title = data.title;
    this.companyName = data.companyName;
    this.companyLogo = data.companyLogo || null;
    this.location = data.location;
    this.salaryRange = data.salaryRange || null;

    this.shortDescription = data.shortDescription;
    this.aboutRole = data.aboutRole;
    this.responsibilities = Array.isArray(data.responsibilities)
      ? data.responsibilities
      : [];
    this.requirements = Array.isArray(data.requirements)
      ? data.requirements
      : [];
    this.benefits = Array.isArray(data.benefits) ? data.benefits : [];

    this.deadline = data.deadline ? new Date(data.deadline) : null;
    this.contactEmail = data.contactEmail;
    this.formConfig = data.formConfig
      ? {
          resume: data.formConfig.resume,
          coverLetter: data.formConfig.coverLetter,
          workExperience: data.formConfig.workExperience,
          educationDetails: data.formConfig.educationDetails,
          skills: data.formConfig.skills,
          personalWebsite: data.formConfig.personalWebsite,
          linkedInProfile: data.formConfig.linkedInProfile,
          gitHubProfile: data.formConfig.gitHubProfile,
        }
      : {};
    this.jobTypeId = data.jobTypeId;
    this.categoryId = data.categoryId;
    this.experienceLevelId = data.experienceLevelId;
  }
}

export class filterJobDTO {
  constructor(query = {}) {
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 10;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
    this.search = query.search;
    this.locationSearch = query.locationSearch;
    this.jobType = query.jobType;
    this.category = query.category;
    this.experienceLevel = query.experienceLevel;
  }

  /**
   * Get pagination offset
   */
  getOffset() {
    return (this.page - 1) * this.limit;
  }
}

export class UpdateJobDTO {
  constructor(data) {
    if (data.title) this.title = data.title;
    if (data.companyName) this.companyName = data.companyName;
    if (data.companyLogo !== undefined) this.companyLogo = data.companyLogo;
    if (data.location) this.location = data.location;
    if (data.salaryRange !== undefined) this.salaryRange = data.salaryRange;

    if (data.shortDescription) this.shortDescription = data.shortDescription;
    if (data.aboutRole) this.aboutRole = data.aboutRole;

    if (data.responsibilities) this.responsibilities = data.responsibilities;
    if (data.requirements) this.requirements = data.requirements;
    if (data.benefits) this.benefits = data.benefits;

    if (data.deadline) this.deadline = new Date(data.deadline);
    if (data.contactEmail) this.contactEmail = data.contactEmail;

    if (data.formConfig) {
      this.formConfig = data.formConfig;
    }

    if (data.jobTypeId) this.jobTypeId = data.jobTypeId;
    if (data.categoryId) this.categoryId = data.categoryId;
    if (data.experienceLevelId) this.experienceLevelId = data.experienceLevelId;
  }
}
