export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// 确保模块有运行时导出
export const DEFAULT_TIMEOUT = 10000;
