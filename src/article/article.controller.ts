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
} from '@nestjs/common';
import {
  ArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';
import { ArticleService } from './article.service';
import { ApiQuery } from '@nestjs/swagger';
import { ApiSortingPagination } from '../common/apiQuery';
import { ArticleStatus } from 'generated/prisma/client';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    const article = await this.articleService.create(createArticleDto);
    return {
      ...article,
      status: article.status.toLowerCase(),
    };
  }

  @Get()
  @ApiQuery({ name: 'status', enum: ArticleStatus, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'tag', type: String, required: false })
  @ApiSortingPagination()
  async findAll(@Query() query?: ArticleQueryDto) {
    const result = await this.articleService.findAll(query);
    const transformedData = result?.data.map((article) => ({
      ...article,
      status: article.status.toLowerCase(),
    }));
    if (result && Array.isArray(result.data) && result.page && result.limit) {
      return { ...result, data: transformedData };
    }

    return transformedData;
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect Article Id');
        },
      }),
    )
    id: string,
  ) {
    const article = await this.articleService.findOne(id);
    return {
      ...article,
      status: article.status.toLowerCase(),
    };
  }

  @Put(':id')
  async update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect Article Id');
        },
      }),
    )
    id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return await this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect Article Id');
        },
      }),
    )
    id: string,
  ) {
    await this.articleService.delete(id);
    return;
  }
}
