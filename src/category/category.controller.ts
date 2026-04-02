import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('category')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    create(@Body() categoryDto: CategoryDto) {
        return this.categoryService.create(categoryDto)

    }

    @Get()
    findAll() {
        return this.categoryService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect Category Id');
        }
    })) id: string) {
        return this.categoryService.findOne(id)
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect Category Id');
        }
    })) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto)

    }

    @Delete(':id')
    @HttpCode(204)
    delete(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect Category Id');
        }
    })) id: string) {
        this.categoryService.delete(id);
        return
    }
}
