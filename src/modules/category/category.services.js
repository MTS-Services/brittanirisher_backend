const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class CategoryService {
  slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async createCategory(data) {
    const categoryName = data.name.trim();
    const slug = data.slug
      ? this.slugify(data.slug)
      : this.slugify(categoryName);

    return prisma.category.create({
      data: {
        name: categoryName,
        slug,
      },
    });
  }

  async getCategories() {
    return prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoryById(id) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  async updateCategory(id, data) {
    await this.getCategoryById(id);

    const updateData = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.slug !== undefined ? { slug: this.slugify(data.slug) } : {}),
    };

    if (data.name !== undefined && data.slug === undefined) {
      updateData.slug = this.slugify(data.name);
    }

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id) {
    await this.getCategoryById(id);

    await prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });

    return true;
  }
}

module.exports = CategoryService;
