import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { authApi } from '../api';

const handlers = [
  http.post('*/api/login', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        user: {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          avatar: null,
          status: true,
          expires_at: null,
          remarks: null,
          created_at: '2026-05-20',
          updated_at: '2026-05-20',
          roles: [],
        },
        token: '1|test_token',
      },
    });
  }),
  http.post('*/api/logout', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: null,
    });
  }),
  http.get('*/api/user', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        avatar: null,
        status: true,
        expires_at: null,
        remarks: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        roles: [],
        menus: [],
      },
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('authApi', () => {
  it('login 应该发送 POST 请求并返回正确数据', async () => {
    const loginData = { email: 'admin@test.com', password: '123456' };
    const result = await authApi.login(loginData);
    expect(result).toEqual({
      user: expect.objectContaining({
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
      }),
      token: '1|test_token',
    });
  });

  it('logout 应该发送 POST 请求', async () => {
    let logoutCalled = false;
    server.use(
      http.post('*/api/logout', () => {
        logoutCalled = true;
        return HttpResponse.json({
          code: 0,
          message: 'success',
          data: null,
        });
      }),
    );

    await authApi.logout();
    expect(logoutCalled).toBe(true);
  });

  it('getCurrentUser 应该发送 GET 请求', async () => {
    server.use(
      http.get('*/api/user', () => {
        return HttpResponse.json({
          code: 0,
          message: 'success',
          data: {
            id: 1,
            name: 'Admin',
            email: 'admin@test.com',
            avatar: null,
            status: true,
            expires_at: null,
            remarks: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-01',
            roles: [],
            menus: [],
          },
        });
      }),
    );

    const result = await authApi.getCurrentUser();
    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
      }),
    );
  });
});
