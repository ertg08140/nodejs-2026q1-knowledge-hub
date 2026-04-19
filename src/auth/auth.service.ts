import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthRefreshUserDto, AuthUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string) {
    const salt = Number(process.env.CRYPT_SALT) || 10;
    return await bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async signUp(signUpUserDto: AuthUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          ...signUpUserDto,
          updatedAt: Math.floor(Date.now() / 1000),
          createdAt: Math.floor(Date.now() / 1000),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Login already taken');
        }
      }

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async generateTokens(payload: object) {
    return await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.TOKEN_EXPIRE_TIME as SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env
          .TOKEN_REFRESH_EXPIRE_TIME as SignOptions['expiresIn'],
      }),
    ]);
  }

  async login(loginUserDto: AuthUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { login: loginUserDto.login },
      });

      if (!user) {
        throw new ForbiddenException('Incorrect user data');
      }

      const isCorrect = await this.comparePasswords(
        loginUserDto.password,
        user.password,
      );

      if (!isCorrect) {
        throw new ForbiddenException('Incorrect password');
      }

      const payload = {
        userId: user.id,
        login: user.login,
        role: user.role,
      };

      const [accessToken, refreshToken] = await this.generateTokens(payload);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async refresh(refreshUserDto: AuthRefreshUserDto) {
    try {
      const { userId, login, role } = await this.jwtService.verifyAsync(
        refreshUserDto.refreshToken,
        {
          secret: process.env.JWT_SECRET_REFRESH_KEY,
        },
      );

      const [accessToken, refreshToken] = await this.generateTokens({
        userId,
        login,
        role,
      });

      return { accessToken, refreshToken };
    } catch (e) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
