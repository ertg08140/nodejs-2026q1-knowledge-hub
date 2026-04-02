import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/user.dto';
import { randomUUID } from 'node:crypto';


@Injectable()
export class UsersService {

    private usersDb = [];

    create(createUserDto: CreateUserDto) {

        const user = {
            id: randomUUID(),
            ...createUserDto,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }

        this.usersDb.push(user);
        return user;
    }

    findAll() {
        return this.usersDb;
    }

    findOne(id: string) {
        const user = this.usersDb.find(user => user.id === id);
        if (!user) throw new NotFoundException('User Not Found');

        return user;
    }

    updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
        const user = this.findOne(id)

        if (user.password !== updatePasswordDto.oldPassword) throw new ForbiddenException('Incorrect password')

        const updatedUser = { ...user, password: updatePasswordDto.newPassword, updatedAt: Date.now() }

        this.usersDb = this.usersDb.map(user => {
            if (user.id === id && user.password === updatePasswordDto.oldPassword) {
                return updatedUser
            }
            return user
        })

        return this.findOne(id)

    }

    delete(id: string) {
        const user = this.findOne(id)
        this.usersDb = this.usersDb.filter(user => user.id !== id)

    }

}
