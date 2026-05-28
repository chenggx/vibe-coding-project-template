export function getApiErrorMessage(err: unknown, fallback = '操作失败'): string {
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const data = (err as Record<string, unknown>).data;
    if (data && typeof data === 'object' && 'message' in data) {
      return String(data.message);
    }
    if ('message' in err) {
      return String((err as Record<string, unknown>).message);
    }
  }
  return fallback;
}
