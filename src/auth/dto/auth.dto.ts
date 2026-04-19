import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AuthUserDto {
  @IsString()
  @ApiProperty()
  readonly login: string;

  @IsString()
  @ApiProperty()
  readonly password: string;
}

export class AuthRefreshUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly refreshToken: string;
}
