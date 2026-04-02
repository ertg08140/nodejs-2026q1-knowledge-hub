import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ArticleService } from '../article/article.service'
import { Order } from '../commonDto/sortQueryDto';


@Injectable()
export class CategoryService {

    private categoryDb = [];

    constructor(private readonly articleService: ArticleService) { }

    create(categoryDto: CategoryDto) {

        const category = {
            id: randomUUID(),
            ...categoryDto,

        }

        this.categoryDb.push(category);
        return category;
    }

    findAll(sortBy?: string, order?: Order) {
        return this.categoryDb.sort((a, b) => {
            if (sortBy) {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                if (aValue < bValue) return order === 'asc' ? -1 : 1;
                if (aValue > bValue) return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    findOne(id: string) {
        const category = this.categoryDb.find(category => category.id === id);
        if (!category) throw new NotFoundException('Category Not Found');

        return category;
    }

    update(id: string, updateCategoryDto: UpdateCategoryDto) {
        const category = this.findOne(id)

        const updatedCategory = { ...category, ...updateCategoryDto, }

        this.categoryDb = this.categoryDb.map(category => {
            if (category.id === id) {
                return updatedCategory
            }
            return category
        })

        return this.findOne(id)

    }

    delete(id: string) {
        const category = this.findOne(id)
        const articles = this.articleService.findAll()
        articles.forEach((article) => {
            if (article.categoryId === id) {
                this.articleService.update(article.id, { categoryId: null })
            }
        })

        this.categoryDb = this.categoryDb.filter(category => category.id !== id)

    }

}
