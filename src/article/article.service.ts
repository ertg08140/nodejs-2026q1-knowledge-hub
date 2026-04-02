import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { randomUUID } from 'crypto';
import { CommentService } from '../comment/comment.service';
import { Order } from '../commonDto/sortQueryDto';

@Injectable()
export class ArticleService {

    private articleDb = [];
    constructor(
        @Inject(forwardRef(() => CommentService))
        private readonly commentService: CommentService,
    ) { }

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

    findAll(status?: string, categoryId?: string, tag?: string, sortBy?: string, order?: Order) {

        return this.articleDb.filter(article =>
            (status && article.status === status) ||
            (categoryId && article.categoryId === categoryId) ||
            (tag && article.tags.includes(tag)) ||
            (!status && !categoryId && !tag)
        ).sort((a, b) => {
            if (sortBy) {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                if (aValue < bValue) return order === 'asc' ? -1 : 1;
                if (aValue > bValue) return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
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
        this.commentService.deleteCommentsByArticleId(id)
        this.articleDb = this.articleDb.filter(article => article.id !== id)

    }
}
