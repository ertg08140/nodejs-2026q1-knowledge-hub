import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user.dto';
import { AuthRefreshUserDto, AuthUserDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiBody({ type: AuthUserDto })
  async create(@Body() signUpUserDto: AuthUserDto) {
    const hashedPassword = await this.authService.hashPassword(
      signUpUserDto.password,
    );
    const user = await this.authService.signUp({
      ...signUpUserDto,
      password: hashedPassword,
    });

    const transformedUser = {
      ...user,
      role: user.role,
    };
    return plainToInstance(UserResponseDto, transformedUser, {
      excludeExtraneousValues: true,
    });
  }

  @Post('/login')
  @ApiBody({ type: AuthUserDto })
  async check(@Body() loginUserDto: AuthUserDto) {
    const tokens = await this.authService.login(loginUserDto);
    return tokens;
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiBody({ type: AuthRefreshUserDto })
  async refresh(@Body() authRefreshUserDto: AuthRefreshUserDto) {
    if (!authRefreshUserDto.refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const tokens = await this.authService.refresh(authRefreshUserDto);
    return tokens;
  }
}
