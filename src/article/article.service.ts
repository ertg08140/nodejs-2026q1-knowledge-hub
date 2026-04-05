import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';
import { randomUUID } from 'crypto';
import { CommentService } from '../comment/comment.service';
import { sortAndPaginateData } from 'src/utils/sortAndPaginateDate';

@Injectable()
export class ArticleService {
  private articleDb = [];
  constructor(
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
  ) {}

  create(createArticleDto: CreateArticleDto) {
    const article = {
      id: randomUUID(),
      ...createArticleDto,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.articleDb.push(article);
    return article;
  }

  findAll(query?: ArticleQueryDto) {
    const { status, categoryId, tag } = query;
    const filteredData = this.articleDb.filter(
      (article) =>
        (status && article.status === status) ||
        (categoryId && article.categoryId === categoryId) ||
        (tag && article.tags.includes(tag)) ||
        (!status && !categoryId && !tag),
    );
    return sortAndPaginateData(filteredData, query);
  }

  findArticleById(id: string) {
    return this.articleDb.find((article) => article.id === id);
  }

  findOne(id: string) {
    const article = this.findArticleById(id);
    console.log('articleDB', this.articleDb);
    console.log('article', article);
    if (!article) throw new NotFoundException('Article Not Found');

    return article;
  }

  update(id: string, updateArticleDto: UpdateArticleDto) {
    const article = this.findOne(id);

    const updatedArticle = {
      ...article,
      ...updateArticleDto,
      updatedAt: Date.now(),
    };

    this.articleDb = this.articleDb.map((article) => {
      if (article.id === id) {
        return updatedArticle;
      }
      return article;
    });

    return this.findOne(id);
  }

  delete(id: string) {
    this.findOne(id);
    this.commentService.deleteCommentsByArticleId(id);
    this.articleDb = this.articleDb.filter((article) => article.id !== id);
  }

  deleteCategoryFromArticle(categoryId: string) {
    this.articleDb.forEach((article) => {
      if (article.categoryId === categoryId) {
        article.categoryId = null;
      }
    });
  }
  deleteUserFromArticle(authorId: string) {
    this.articleDb.forEach((article) => {
      if (article.authorId === authorId) {
        article.authorId = null;
      }
    });
  }
}
