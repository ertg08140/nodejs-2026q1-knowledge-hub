import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Order } from './sortQueryDto';

export function ApiSortingPagination() {
  return applyDecorators(
    ApiQuery({ name: 'sortBy', type: String, required: false }),
    ApiQuery({ name: 'order', enum: Order, required: false }),
    ApiQuery({ name: 'page', type: Number, required: false }),
    ApiQuery({ name: 'limit', type: Number, required: false }),
  );
}
