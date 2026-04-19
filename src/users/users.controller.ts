import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UserResponseDto,
  UpdatePasswordDto,
} from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { ApiBody } from '@nestjs/swagger';
import { ApiSortingPagination } from '../common/apiQuery';
import { PaginationSortQueryDto } from 'src/common/paginationQuery.Dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';
import { RolesGuard } from 'src/auth/roles.guard';
import { GetUser, UserPayload } from 'src/common/decorators/user.decorator';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.admin)
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return plainToInstance(UserResponseDto, user);
  }

  @Get()
  @ApiSortingPagination()
  async findAll(@Query() query: PaginationSortQueryDto) {
    const result = await this.usersService.findAll(query);
    const transformedData = result?.data.map((user) => ({
      ...user,
      role: user.role,
    }));
    if (result && Array.isArray(result.data) && result.page && result.limit) {
      result.data = plainToInstance(UserResponseDto, result.data, {
        excludeExtraneousValues: true,
      });
      return { ...result, data: transformedData };
    }

    return plainToInstance(UserResponseDto, transformedData, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect User Id');
        },
      }),
    )
    id: string,
  ) {
    const user = await this.usersService.findOne(id);
    const transformedUser = { ...user, role: user.role };
    return plainToInstance(UserResponseDto, transformedUser, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  async updatePassword(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect User Id');
        },
      }),
    )
    id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUser() user: UserPayload,
  ) {
    const returnedUser = this.usersService.updatePassword(
      id,
      user,
      updatePasswordDto,
    );
    return plainToInstance(UserResponseDto, returnedUser);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @HttpCode(204)
  async delete(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: () => {
          return new BadRequestException('Incorrect User Id');
        },
      }),
    )
    id: string,
  ) {
    await this.usersService.delete(id);
    return;
  }
}
