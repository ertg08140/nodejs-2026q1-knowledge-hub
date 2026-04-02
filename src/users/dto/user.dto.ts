import { Exclude } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @IsString()
  readonly login: string;

  @IsString()
  readonly password: string;

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
  @IsString()
  readonly oldPassword: string;

  @IsString()
  readonly newPassword: string;
}
