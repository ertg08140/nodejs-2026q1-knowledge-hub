import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ApiQuery } from '@nestjs/swagger';
import { Order, SortDto } from '../commonDto/sortQueryDto';

@Controller('category')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    create(@Body() categoryDto: CategoryDto) {
        return this.categoryService.create(categoryDto)

    }

    @Get()
    @ApiQuery({ name: 'sortBy', type: String, required: false })
    @ApiQuery({ name: 'order', enum: Order, required: false })
    findAll(@Query() query: SortDto) {
        const { sortBy, order } = query;
        return this.categoryService.findAll(sortBy, order)
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
