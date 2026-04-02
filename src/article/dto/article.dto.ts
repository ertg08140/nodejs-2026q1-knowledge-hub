
import { PartialType } from '@nestjs/mapped-types';
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';



export enum ArticleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export class CreateArticleDto {
    @IsString()
    readonly title: string;

    @IsString()
    readonly content: string;

    @IsOptional()
    @IsEnum(ArticleStatus, {
        message: `$value is incorrect Should provide correct role - ${Object.values(ArticleStatus).join(', ')}`,
    })
    status: ArticleStatus = ArticleStatus.DRAFT;

    @IsOptional()
    @IsString()
    @IsUUID()
    readonly authorId?: string | null;

    @IsOptional()
    @IsString()
    readonly categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    readonly tags?: string[];

}

export class UpdateArticleDto extends PartialType(CreateArticleDto) { }