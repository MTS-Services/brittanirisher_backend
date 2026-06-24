const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class StateService {
  slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async create(data) {
    const categoryName = data.name.trim();
    const slug = data.slug
      ? this.slugify(data.slug)
      : this.slugify(categoryName);

    return prisma.state.create({
      data: {
        name: categoryName,
        slug,
        stateId: data.stateId,
      },
    });
  }

  async getAll() {
    return prisma.state.findMany({
      where: { isDeleted: false },
      include: {
        cities: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id) {
    const category = await prisma.state.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('State not found', 404);
    }

    return category;
  }

  async update(id, data) {
    await this.getById(id);

    const updateData = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.slug !== undefined ? { slug: this.slugify(data.slug) } : {}),
    };

    if (data.name !== undefined && data.slug === undefined) {
      updateData.slug = this.slugify(data.name);
    }

    return prisma.state.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id) {
    await this.getById(id);

    await prisma.state.update({
      where: { id },
      data: { isDeleted: true },
    });

    return true;
  }
}

module.exports = StateService;
