
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';
import { SortDto } from '../../commonDto/sortQueryDto';



export enum ArticleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export class CreateArticleDto {
    @ApiProperty()
    @IsString()
    readonly title: string;

    @ApiProperty()
    @IsString()
    readonly content: string;

    @ApiPropertyOptional({ enum: ArticleStatus, default: ArticleStatus.DRAFT })
    @IsOptional()
    @IsEnum(ArticleStatus, {
        message: `$value is incorrect Should provide correct role - ${Object.values(ArticleStatus).join(', ')}`,
    })
    status: ArticleStatus = ArticleStatus.DRAFT;

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

export class UpdateArticleDto extends PartialType(CreateArticleDto) { }

export class ArticleQueryDto extends SortDto {
    @IsOptional()
    @IsEnum(ArticleStatus, {
        message: `$value is incorrect Should provide correct role - ${Object.values(ArticleStatus).join(', ')}`,
    })
    status?: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsString()
    tag?: string;

}