export interface BaseResponse<T> {
  success: boolean;
  message: string;
  error_code?: string;
  details?: string | null;
  data?: T | null;
}

export interface BasePaginatedResponse<T> extends BaseResponse<T> {
  pagination?: {
    totalRecords?: number;
    currentPage?: number;
    pageSize?: number;
    totalPages?: number;
  } | null;
}
