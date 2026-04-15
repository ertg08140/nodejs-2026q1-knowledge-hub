import { forwardRef, Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CommentModule } from '../comment/comment.module';

import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [forwardRef(() => CommentModule), PrismaModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
