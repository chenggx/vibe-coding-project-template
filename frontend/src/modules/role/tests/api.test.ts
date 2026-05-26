import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { roleApi } from '../api';

const mockRole = {
  id: 1,
  name: 'admin',
  display_name: '管理员',
  description: '系统管理员',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  users_count: 5,
};

const handlers = [
  http.get('*/api/roles', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: [mockRole],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    });
  }),
  http.get('*/api/roles/1', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockRole,
    });
  }),
  http.post('*/api/roles', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: { ...mockRole, id: 2, name: 'editor', display_name: '编辑' },
    });
  }),
  http.put('*/api/roles/1', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: { ...mockRole, display_name: '已更新' },
    });
  }),
  http.delete('*/api/roles/1', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: null,
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('roleApi', () => {
  it('getRoles 应该获取角色列表', async () => {
    const result = await roleApi.getRoles({ page: 1, per_page: 15 });
    expect(result).toEqual({
      data: [mockRole],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    });
  });

  it('getRole 应该获取指定角色', async () => {
    const result = await roleApi.getRole(1);
    expect(result).toEqual(mockRole);
  });

  it('createRole 应该创建新角色', async () => {
    const result = await roleApi.createRole({
      name: 'editor',
      display_name: '编辑',
    });
    expect(result).toEqual(
      expect.objectContaining({ name: 'editor', display_name: '编辑' }),
    );
  });

  it('updateRole 应该更新角色', async () => {
    const result = await roleApi.updateRole(1, { display_name: '已更新' });
    expect(result).toEqual(
      expect.objectContaining({ display_name: '已更新' }),
    );
  });

  it('deleteRole 应该删除角色', async () => {
    let deleteCalled = false;
    server.use(
      http.delete('*/api/roles/1', () => {
        deleteCalled = true;
        return HttpResponse.json({
          code: 0,
          message: 'success',
          data: null,
        });
      }),
    );

    await roleApi.deleteRole(1);
    expect(deleteCalled).toBe(true);
  });
});
