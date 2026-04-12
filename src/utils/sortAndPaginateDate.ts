import { PaginationSortQueryDto } from 'src/common/paginationQuery.Dto';

export const sortAndPaginateData = (
  arrayData: object[],
  query: PaginationSortQueryDto,
) => {
  const { sortBy, order, page, limit } = query;
  const sortedData = [...arrayData].sort((a, b) => {
    if (sortBy) {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (page && limit) {
    return {
      total: sortedData.length,
      page,
      limit,
      data: sortedData.slice((page - 1) * limit, page * limit),
    };
  }
  return sortedData;
};
