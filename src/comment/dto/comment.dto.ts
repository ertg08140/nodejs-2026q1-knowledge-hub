import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsString()
  readonly content: string;

  @ApiProperty()
  @IsString()
  @IsUUID(4)
  readonly articleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly authorId: string | null;
}
