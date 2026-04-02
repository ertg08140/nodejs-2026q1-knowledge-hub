import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {

    constructor(private readonly articleService: ArticleService) { }

    @Post()
    create(@Body() createArticleDto: CreateArticleDto) {
        return this.articleService.create(createArticleDto)

    }

    @Get()
    findAll() {
        return this.articleService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect Article Id');
        }
    })) id: string) {
        return this.articleService.findOne(id)
    }

    @Put(':id')
    update(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect Article Id');
        }
    })) id: string, @Body() updateArticleDto: UpdateArticleDto) {
        return this.articleService.update(id, updateArticleDto)

    }

    @Delete(':id')
    @HttpCode(204)
    delete(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect Article Id');
        }
    })) id: string) {
        this.articleService.delete(id);
        return
    }


}
