import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
  @ApiProperty()
  readonly refreshToken: string;
}
