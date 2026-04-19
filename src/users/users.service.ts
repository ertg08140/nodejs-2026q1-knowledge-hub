import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/user.dto';
import { sortAndPaginatePrismaData } from '../utils/sortAndPaginateDate';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, UserRole } from 'generated/prisma/client';
import { PaginationSortQueryDto } from 'src/common/paginationQuery.Dto';
import { UserPayload } from 'src/common/decorators/user.decorator';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          updatedAt: Math.floor(Date.now() / 1000),
          createdAt: Math.floor(Date.now() / 1000),
        },
      });
    } catch (error) {
      throw new ForbiddenException('Error creating user');
    }
  }

  async findAll(query: PaginationSortQueryDto) {
    const { page, limit } = query;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany(sortAndPaginatePrismaData(query)),
      this.prisma.user.count(),
    ]);

    return {
      data: items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User Not Found');

    return user;
  }

  async updatePassword(
    id: string,
    user: UserPayload,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const returnedUser = await this.findOne(id);

    if (!returnedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role !== UserRole.admin && returnedUser.id !== user.userId) {
      throw new ForbiddenException('Forbidden resource');
    }

    if (returnedUser.password !== updatePasswordDto.oldPassword)
      throw new ForbiddenException('Incorrect password');

    return await this.prisma.user.update({
      where: { id },
      data: {
        password: updatePasswordDto.newPassword,
        updatedAt: Math.floor(Date.now() / 1000),
      },
    });
  }

  async delete(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Not Found: User with id ${id} does not exist`,
          );
        }
      }
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
