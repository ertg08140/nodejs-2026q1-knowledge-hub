import { IsInt, IsOptional, Min } from 'class-validator';
import { SortDto } from './sortQueryDto';
import { Type } from 'class-transformer';

export class PaginationSortQueryDto extends SortDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
