import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ArticleService {

    private articleDb = [];
    create(createArticleDto: CreateArticleDto) {

        const article = {
            id: randomUUID(),
            ...createArticleDto,
            createdAt: Date.now(),
            updatedAt: Date.now()

        }

        this.articleDb.push(article);
        return article;
    }

    findAll() {
        return this.articleDb;
    }

    findArticleById(id: string) {
        return this.articleDb.find(article => article.id === id);
    }

    findOne(id: string) {
        const article = this.findArticleById(id);
        console.log('articleDB', this.articleDb)
        console.log('article', article)
        if (!article) throw new NotFoundException('Article Not Found');

        return article;
    }

    update(id: string, updateArticleDto: UpdateArticleDto) {
        const article = this.findOne(id)

        const updatedArticle = { ...article, ...updateArticleDto, updatedAt: Date.now() }

        this.articleDb = this.articleDb.map(article => {
            if (article.id === id) {
                return updatedArticle
            }
            return article
        })

        return this.findOne(id)

    }

    delete(id: string) {
        const article = this.findOne(id)
        this.articleDb = this.articleDb.filter(article => article.id !== id)

    }
}
