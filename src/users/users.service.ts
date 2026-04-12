import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/user.dto';
import { randomUUID } from 'node:crypto';
import { ArticleService } from '../article/article.service';
import { CommentService } from '../comment/comment.service';
import { PaginationSortQueryDto } from '../common/paginationQuery.Dto';
import { sortAndPaginateData } from '../utils/sortAndPaginateDate';

@Injectable()
export class UsersService {
  private usersDb = [];

  constructor(
    private readonly articleService: ArticleService,
    private readonly commentService: CommentService,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = {
      id: randomUUID(),
      ...createUserDto,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.usersDb.push(user);
    return user;
  }

  findAll(query: PaginationSortQueryDto) {
    return sortAndPaginateData(this.usersDb, query);
  }

  findOne(id: string) {
    const user = this.usersDb.find((user) => user.id === id);
    if (!user) throw new NotFoundException('User Not Found');

    return user;
  }

  updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = this.findOne(id);

    if (user.password !== updatePasswordDto.oldPassword)
      throw new ForbiddenException('Incorrect password');

    const updatedUser = {
      ...user,
      password: updatePasswordDto.newPassword,
      updatedAt: Date.now(),
    };

    this.usersDb = this.usersDb.map((user) => {
      if (user.id === id && user.password === updatePasswordDto.oldPassword) {
        return updatedUser;
      }
      return user;
    });

    return this.findOne(id);
  }

  delete(id: string) {
    this.findOne(id);
    this.articleService.deleteUserFromArticle(id);

    this.commentService.deleteCommentsByAuthorId(id);
    this.usersDb = this.usersDb.filter((user) => user.id !== id);
  }
}
