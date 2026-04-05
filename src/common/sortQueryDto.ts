import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export class SortDto {
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(Order, {
    message: `$value is incorrect Should provide correct role - ${Object.values(Order).join(', ')}`,
  })
  order?: Order;
}
