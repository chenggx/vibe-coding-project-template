import { message } from 'antd';
import type { ApiError } from './api';

export function handleApiError(error: unknown): void {
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError;
    message.error(apiError.message);
  } else if (error instanceof Error) {
    message.error(error.message);
  } else {
    message.error('请求失败，请稍后重试');
  }
}
