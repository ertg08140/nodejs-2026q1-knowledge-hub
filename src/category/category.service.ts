import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';


@Injectable()
export class CategoryService {

    private categoryDb = [];
    create(categoryDto: CategoryDto) {

        const category = {
            id: randomUUID(),
            ...categoryDto,

        }

        this.categoryDb.push(category);
        return category;
    }

    findAll() {
        return this.categoryDb;
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
        this.categoryDb = this.categoryDb.filter(category => category.id !== id)

    }

}
