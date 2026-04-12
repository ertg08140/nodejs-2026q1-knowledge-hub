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
  ArticleStatus,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';
import { ArticleService } from './article.service';
import { ApiQuery } from '@nestjs/swagger';
import { ApiSortingPagination } from '../common/apiQuery';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articleService.create(createArticleDto);
  }

  @Get()
  @ApiQuery({ name: 'status', enum: ArticleStatus, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'tag', type: String, required: false })
  @ApiSortingPagination()
  findAll(@Query() query?: ArticleQueryDto) {
    return this.articleService.findAll(query);
  }

  @Get(':id')
  findOne(
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
    return this.articleService.findOne(id);
  }

  @Put(':id')
  update(
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
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(
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
    this.articleService.delete(id);
    return;
  }
}
