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

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    const transformedUser = { ...user, role: user.role.toLowerCase() };
    return plainToInstance(UserResponseDto, transformedUser);
  }

  @Get()
  @ApiSortingPagination()
  async findAll(@Query() query: PaginationSortQueryDto) {
    const result = await this.usersService.findAll(query);
    const transformedData = result?.data.map((user) => ({
      ...user,
      role: user.role.toLowerCase(),
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
    const transformedUser = { ...user, role: user.role.toLowerCase() };
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
  ) {
    const user = this.usersService.updatePassword(id, updatePasswordDto);
    return plainToInstance(UserResponseDto, user);
  }

  @Delete(':id')
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
