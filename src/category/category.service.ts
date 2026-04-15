import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { sortAndPaginatePrismaData } from '../utils/sortAndPaginateDate';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { PaginationSortQueryDto } from 'src/common/paginationQuery.Dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(categoryDto: CategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          ...categoryDto,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error creating category');
    }
  }

  async findAll(query?: PaginationSortQueryDto) {
    const { page, limit } = query;

    const [items, total] = await Promise.all([
      this.prisma.category.findMany(sortAndPaginatePrismaData(query)),
      this.prisma.category.count(),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category Not Found');

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
        },
      });
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
      return await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Not Found: Category with id ${id} does not exist`,
          );
        }
      }
      throw new InternalServerErrorException('Error deleting category');
    }
  }
}
