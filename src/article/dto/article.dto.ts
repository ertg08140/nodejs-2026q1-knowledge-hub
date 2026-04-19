import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationSortQueryDto } from 'src/common/paginationQuery.Dto';
import { ArticleStatus } from '../../../generated/prisma/client';
import { Transform } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsString()
  readonly content: string;

  @ApiPropertyOptional({ enum: ArticleStatus, default: ArticleStatus.draft })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(ArticleStatus, {
    message: `$value is incorrect Should provide correct role - ${Object.values(ArticleStatus).join(', ')}`,
  })
  status: ArticleStatus = ArticleStatus.draft;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  readonly authorId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  readonly categoryId?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class ArticleQueryDto extends PaginationSortQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(ArticleStatus, {
    message: `$value is incorrect Should provide correct role - ${Object.values(ArticleStatus).join(', ')}`,
  })
  status?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
