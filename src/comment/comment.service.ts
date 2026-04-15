import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/comment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto) {
    const { authorId, articleId, ...rest } = createCommentDto;

    try {
      return await this.prisma.comment.create({
        data: {
          ...rest,
          ...(authorId ? { author: { connect: { id: authorId } } } : undefined),
          ...(articleId
            ? { article: { connect: { id: articleId } } }
            : undefined),
          createdAt: Math.floor(Date.now() / 1000),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UnprocessableEntityException(
            `Incorrect authorId or articleId provided. Please ensure they exist.`,
          );
        }
      }

      throw new InternalServerErrorException('Error creating comment');
    }
  }

  async findComment(articleId: string) {
    return await this.prisma.comment.findMany({
      where: { articleId },
    });
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) throw new NotFoundException('Comment Not Found');

    return comment;
  }

  async delete(id: string) {
    try {
      return await this.prisma.comment.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Not Found: Comment with id ${id} does not exist`,
          );
        }
      }
      throw new InternalServerErrorException('Error deleting comment');
    }
  }
}
