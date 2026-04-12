import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCommentDto } from './dto/comment.dto';
import { ArticleService } from '../article/article.service';

@Injectable()
export class CommentService {
  private commentDb = [];

  constructor(
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
  ) {}
  create(createCommentDto: CreateCommentDto) {
    const article = this.articleService.findArticleById(
      createCommentDto.articleId,
    );

    if (!article) throw new UnprocessableEntityException('No such article');

    const comment = {
      id: randomUUID(),
      ...createCommentDto,
      createdAt: Date.now(),
    };

    this.commentDb.push(comment);
    return comment;
  }

  findComment(articleId: string) {
    return this.commentDb.filter((comment) => comment.articleId === articleId);
  }

  findOne(id: string) {
    const comment = this.commentDb.find((comment) => comment.id === id);

    if (!comment) throw new NotFoundException('Comment Not Found');

    return comment;
  }

  delete(id: string) {
    const comment = this.commentDb.find((comment) => comment.id === id);
    if (!comment) throw new NotFoundException('Comment Not Found');
    this.commentDb = this.commentDb.filter((comment) => comment.id !== id);
  }

  deleteCommentsByAuthorId(authorId: string) {
    this.commentDb = this.commentDb.filter(
      (comment) => comment.authorId !== authorId,
    );
  }

  deleteCommentsByArticleId(articleId: string) {
    this.commentDb = this.commentDb.filter(
      (comment) => comment.articleId !== articleId,
    );
  }
}
