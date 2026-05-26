export interface UploadResponse {
  url: string;
}

export interface UploadState {
  loading: boolean;
  error: string | null;
}

// 确保模块有运行时导出
export const UPLOAD_MAX_SIZE_KB = 2048;
