import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ArticleModule } from '../article/article.module'
import { CommentModule } from '../comment/comment.module';

@Module({
    imports: [ArticleModule, CommentModule],
    controllers: [UsersController],
    providers: [UsersService]
})
export class UsersModule { }
