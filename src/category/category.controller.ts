import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationSortQueryDto } from '../common/paginationQuery.Dto';
import { ApiSortingPagination } from '../common/apiQuery';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() categoryDto: CategoryDto) {
    return await this.categoryService.create(categoryDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiSortingPagination()
  async findAll(@Query() query: PaginationSortQueryDto) {
    const result = await this.categoryService.findAll(query);

    if (result && Array.isArray(result.data) && result.page && result.limit) {
      return result;
    }

    return result.data;
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect Category Id');
        },
      }),
    )
    id: string,
  ) {
    return await this.categoryService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect Category Id');
        },
      }),
    )
    id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async delete(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect Category Id');
        },
      }),
    )
    id: string,
  ) {
    await this.categoryService.delete(id);
    return;
  }
}
