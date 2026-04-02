import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdatePasswordDto } from './dto/user.dto';
import { randomUUID } from 'node:crypto';
import { ArticleService } from '../article/article.service'
import { CommentService } from '../comment/comment.service'
import { Order } from '../commonDto/sortQueryDto';

@Injectable()
export class UsersService {

    private usersDb = [];

    constructor(private readonly articleService: ArticleService, private readonly commentService: CommentService) { }


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

    findAll(sortBy?: string, order?: Order) {
        return this.usersDb.sort((a, b) => {
            if (sortBy) {
                const aValue = a[sortBy];
                const bValue = b[sortBy];
                if (aValue < bValue) return order === 'asc' ? -1 : 1;
                if (aValue > bValue) return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
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
        const articles = this.articleService.findAll()
        articles.forEach((article) => {
            if (article.authorId === id) {
                this.articleService.update(article.id, { authorId: null })
            }
        })
        this.commentService.deleteCommentsByAuthorId(id)
        this.usersDb = this.usersDb.filter(user => user.id !== id)

    }

}
