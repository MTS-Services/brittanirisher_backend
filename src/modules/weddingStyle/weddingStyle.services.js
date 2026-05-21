const { prisma } = require('../../config/database');
const { AppError } = require('../../middlewares/errorHandler');

class WeddingStyleService {
  slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async createWeddingStyle(data) {
    const styleName = data.name.trim();
    const slug = data.slug ? this.slugify(data.slug) : this.slugify(styleName);

    return prisma.weddingStyle.create({
      data: {
        name: styleName,
        slug,
      },
    });
  }

  async getWeddingStyles() {
    return prisma.weddingStyle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWeddingStyleById(id) {
    const style = await prisma.weddingStyle.findUnique({
      where: { id },
    });

    if (!style) {
      throw new AppError('Wedding style not found', 404);
    }

    return style;
  }

  async updateWeddingStyle(id, data) {
    await this.getWeddingStyleById(id);

    const updateData = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.slug !== undefined ? { slug: this.slugify(data.slug) } : {}),
    };

    if (data.name !== undefined && data.slug === undefined) {
      updateData.slug = this.slugify(data.name);
    }

    return prisma.weddingStyle.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteWeddingStyle(id) {
    await this.getWeddingStyleById(id);

    await prisma.weddingStyle.delete({
      where: { id },
    });

    return true;
  }
}

module.exports = WeddingStyleService;
