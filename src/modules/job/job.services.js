const { prisma } = require('../../config/database');

class JobService {
  /**
   * Create a new Job
   */
  async createJob(dto, userId) {
    return await prisma.job.create({
      data: {
        title: dto.title,
        companyName: dto.companyName,
        companyLogo: dto.companyLogo,
        location: dto.location,
        salaryRange: dto.salaryRange,
        shortDescription: dto.shortDescription,
        aboutRole: dto.aboutRole,
        responsibilities: dto.responsibilities,
        requirements: dto.requirements,
        benefits: dto.benefits,
        deadline: dto.deadline,
        contactEmail: dto.contactEmail,
        formConfig: dto.formConfig,
        // Relations
        userId: userId,
        jobTypeId: dto.jobTypeId,
        categoryId: dto.categoryId,
        experienceLevelId: dto.experienceLevelId,
      },
      include: {
        jobType: true,
        category: true,
        experienceLevel: true,
      },
    });
  }

  /**
   * Get all Jobs with filtering and relations
   */
  async getAllJobs(filterDTO, userId) {
    const {
      sortBy,
      sortOrder,
      search,
      limit,
      locationSearch,
      jobType,
      category,
      experienceLevel,
    } = filterDTO;

    const offset = filterDTO.getOffset();
    const whereCondition = [];

    if (search) {
      whereCondition.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (locationSearch) {
      whereCondition.push({
        OR: [{ location: { contains: locationSearch, mode: 'insensitive' } }],
      });
    }

    if (userId) {
      whereCondition.push({
        userId: userId,
      });
    }

    if (category) {
      whereCondition.push({ category: { slug: category } });
    }

    if (jobType) {
      whereCondition.push({ jobType: { slug: jobType } });
    }

    if (experienceLevel) {
      whereCondition.push({ experienceLevel: { slug: experienceLevel } });
    }

    const finalWhere = whereCondition.length > 0 ? { AND: whereCondition } : {};
    const [data, total] = await Promise.all([
      prisma.job.findMany({
        where: finalWhere,
        select: {
          id: true,
          title: true,
          companyName: true,
          companyLogo: true,
          location: true,
          salaryRange: true,
          deadline: true,
          shortDescription: true,
          createdAt: true,
          category: { select: { name: true, slug: true } },
          jobType: { select: { name: true, slug: true } },
          experienceLevel: { select: { name: true, slug: true } },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: offset,
        take: limit,
      }),
      prisma.job.count({ where: finalWhere }),
    ]);

    return {
      data,
      pagination: {
        currentPage: filterDTO.page,
        itemsPerPage: filterDTO.limit,
        totalItems: total,
        totalPages: Math.ceil(total / filterDTO.limit),
        hasNextPage: filterDTO.page < Math.ceil(total / filterDTO.limit),
        hasPreviousPage: filterDTO.page > 1,
      },
    };
  }

  /**
   * Get a single Job by ID
   */
  async getJobById(id) {
    return await prisma.job.findUnique({
      where: { id },
      include: {
        jobType: true,
        category: true,
        experienceLevel: true,
      },
    });
  }

  /**
   * Update a Job
   */
  async updateJob(id, dto) {
    return await prisma.job.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  /**
   * Delete a Job
   */
  async deleteJob(id) {
    return await prisma.job.delete({
      where: { id },
    });
  }
}

module.exports = JobService;
