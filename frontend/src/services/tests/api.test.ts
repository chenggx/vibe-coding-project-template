import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import api from '@/services/api';

const server = setupServer(
  http.get('*/api/test-204', () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('*/api/test-error', () => {
    return HttpResponse.json({ code: 1, data: null });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('api interceptor', () => {
  let originalHref = '';

  beforeEach(() => {
    originalHref = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalHref },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: originalHref },
    });
  });

  it('204 No Content 不应崩溃', async () => {
    const result = await api.get('/test-204');
    // axios may return null or empty string for 204; either is fine
    expect(result === null || result === '').toBe(true);
  });

  it('业务错误码缺少 message 时应返回兜底错误消息', async () => {
    await expect(api.get('/test-error')).rejects.toThrow('请求异常');
  });
});
