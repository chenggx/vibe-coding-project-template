export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError extends Error {
  code: number;
}

// 确保模块有运行时导出
export const API_SUCCESS_CODE = 0;
