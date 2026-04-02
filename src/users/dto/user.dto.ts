import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  readonly login: string;

  @IsString()
  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserRole, {
    message: `$value is incorrect Should provide correct role - ${Object.values(UserRole).join(', ')}`,
  })
  role: UserRole = UserRole.VIEWER;
}

export class UserResponseDto {

  @Exclude()
  password: string;

}


export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  readonly oldPassword: string;

  @ApiProperty()
  @IsString()
  readonly newPassword: string;
}
