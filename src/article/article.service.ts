import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';

import { PrismaService } from 'prisma/prisma.service';
import { ArticleStatus, Prisma } from 'generated/prisma/client';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  private transformTags(article: any) {
    if (!article) return article;
    if (Array.isArray(article)) {
      return article.map((a) => ({
        ...a,
        tags: a.tags?.map((t: any) => t.name) || [],
      }));
    }
    return {
      ...article,
      tags: article.tags?.map((t: any) => t.name) || [],
    };
  }

  async create(createArticleDto: CreateArticleDto) {
    const { authorId, categoryId, tags, ...rest } = createArticleDto;

    try {
      const article = await this.prisma.article.create({
        data: {
          ...rest,
          author: authorId ? { connect: { id: authorId } } : undefined,
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          tags: {
            connectOrCreate: tags?.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
          updatedAt: Math.floor(Date.now() / 1000),
          createdAt: Math.floor(Date.now() / 1000),
        },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      return this.transformTags(article);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UnprocessableEntityException(
            `Incorrect authorId, categoryId or tag id provided. Please ensure they exist.`,
          );
        }
      }

      throw new InternalServerErrorException('Error creating article');
    }
  }

  async findAll(query?: ArticleQueryDto) {
    const { status, categoryId, tag, page, limit, sortBy, order } = query || {};

    const where: Prisma.ArticleWhereInput = {
      status: status as ArticleStatus,
      categoryId: categoryId || undefined,
      tags: tag
        ? {
            some: {
              name: tag,
            },
          }
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          author: true,
          category: true,
          tags: true,
        },

        skip: page && limit ? (page - 1) * limit : undefined,
        take: limit ? Number(limit) : undefined,
        orderBy: sortBy ? { [sortBy]: order || 'desc' } : { createdAt: 'desc' },
      }),
      this.prisma.article.count({ where }), // Считаем общее кол-во для фронтенда
    ]);

    return {
      data: this.transformTags(items),
      total,
      page,
      limit,
    };
  }

  async findArticleById(id: string) {
    const article = await this.prisma.article.findFirst({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: true,
      },
    });
    return this.transformTags(article);
  }

  async findOne(id: string) {
    const article = await this.findArticleById(id);
    if (!article) throw new NotFoundException('Article Not Found');

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const { authorId, categoryId, tags, ...rest } = updateArticleDto;
    try {
      const article = await this.prisma.article.update({
        where: { id },
        data: {
          ...rest,
          author: authorId ? { connect: { id: authorId } } : undefined,
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          tags: tags
            ? {
                connectOrCreate: tags.map((tagName) => ({
                  where: { name: tagName },
                  create: { name: tagName },
                })),
              }
            : undefined,
          updatedAt: Math.floor(Date.now() / 1000),
        },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      return this.transformTags(article);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Not Found: Category with id ${id} does not exist`,
          );
        }
      }
      throw new InternalServerErrorException('Error updating category');
    }
  }

  async delete(id: string) {
    try {
      const article = await this.prisma.article.delete({
        where: { id },
        include: {
          author: true,
          category: true,
          tags: true,
        },
      });
      return this.transformTags(article);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Not Found: Article with id ${id} does not exist`,
          );
        }
      }

      throw new InternalServerErrorException('Error deleting article');
    }
  }
}
