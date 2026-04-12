import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ArticleService } from '../article/article.service';

import { PaginationSortQueryDto } from '../common/paginationQuery.Dto';
import { sortAndPaginateData } from '../utils/sortAndPaginateDate';

@Injectable()
export class CategoryService {
  private categoryDb = [];

  constructor(private readonly articleService: ArticleService) {}

  create(categoryDto: CategoryDto) {
    const category = {
      id: randomUUID(),
      ...categoryDto,
    };

    this.categoryDb.push(category);
    return category;
  }

  findAll(query?: PaginationSortQueryDto) {
    return sortAndPaginateData(this.categoryDb, query);
  }

  findOne(id: string) {
    const category = this.categoryDb.find((category) => category.id === id);
    if (!category) throw new NotFoundException('Category Not Found');

    return category;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = this.findOne(id);

    const updatedCategory = { ...category, ...updateCategoryDto };

    this.categoryDb = this.categoryDb.map((category) => {
      if (category.id === id) {
        return updatedCategory;
      }
      return category;
    });

    return this.findOne(id);
  }

  delete(id: string) {
    this.findOne(id);
    this.articleService.deleteCategoryFromArticle(id);

    this.categoryDb = this.categoryDb.filter((category) => category.id !== id);
  }
}
