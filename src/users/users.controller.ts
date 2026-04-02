import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto, UpdatePasswordDto } from './dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Controller('user')
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        const user = this.usersService.create(createUserDto)
        return plainToInstance(UserResponseDto, user);
    }

    @Get()
    findAll() {
        return this.usersService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect User Id');
        }
    })) id: string) {
        return this.usersService.findOne(id)
    }

    @Put(':id')
    updatePassword(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect User Id');
        }
    })) id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
        const user = this.usersService.updatePassword(id, updatePasswordDto)
        return plainToInstance(UserResponseDto, user);
    }

    @Delete(':id')
    @HttpCode(204)
    delete(@Param('id', new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (errors) => {
            return new BadRequestException('Incorrect User Id');
        }
    })) id: string) {
        this.usersService.delete(id);
        return
    }

}
