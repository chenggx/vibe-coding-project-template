import type { MessageInstance } from 'antd/es/message/interface';
import type { ApiError } from './api';

export function handleApiError(error: unknown, message?: MessageInstance): void {
  const showError = (msg: string) => {
    if (message) {
      message.error(msg);
    }
  };

  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError;
    showError(apiError.message);
  } else if (error instanceof Error) {
    showError(error.message);
  } else {
    showError('请求失败，请稍后重试');
  }
}
