export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResponseParams {
  actualPage: number;
  actualPageSize: number;
  lastPage: number;
}
