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
import {
  ArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';
import { ArticleService } from './article.service';
import { ApiQuery } from '@nestjs/swagger';
import { ApiSortingPagination } from '../common/apiQuery';
import { ArticleStatus, UserRole } from 'generated/prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetUser, UserPayload } from 'src/common/decorators/user.decorator';

@Controller('article')
@UseGuards(AuthGuard, RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.editor)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.articleService.create(createArticleDto, userId);
  }

  @Get()
  @ApiQuery({ name: 'status', enum: ArticleStatus, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  @ApiQuery({ name: 'tag', type: String, required: false })
  @ApiSortingPagination()
  async findAll(@Query() query?: ArticleQueryDto) {
    const result = await this.articleService.findAll(query);
    if (result && Array.isArray(result.data) && result.page && result.limit) {
      return result;
    }

    return result?.data;
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
    return await this.articleService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.admin, UserRole.editor)
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
    @GetUser() user: UserPayload,
  ) {
    return await this.articleService.update(id, updateArticleDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.editor)
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
    @GetUser() user: UserPayload,
  ) {
    await this.articleService.delete(id, user);
    return;
  }
}
