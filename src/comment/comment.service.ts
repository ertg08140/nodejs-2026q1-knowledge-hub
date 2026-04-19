import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/comment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, UserRole } from 'generated/prisma/client';
import { UserPayload } from 'src/common/decorators/user.decorator';

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

  async delete(id: string, user: UserPayload) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (
      user.role === UserRole.viewer ||
      (user.role === UserRole.editor &&
        existingComment.authorId !== user.userId)
    ) {
      throw new ForbiddenException('Forbidden resource');
    }
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
