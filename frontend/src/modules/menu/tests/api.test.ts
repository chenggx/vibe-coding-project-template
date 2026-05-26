import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { menuApi } from '../api';

const mockMenu = {
  id: 1,
  parent_id: null,
  name: '用户管理',
  type: 'catalog',
  path: null,
  icon: 'UserOutlined',
  permission: null,
  sort_order: 1,
  meta: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  children: [],
};

const handlers = [
  http.get('*/api/menus/all', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: [mockMenu],
    });
  }),
  http.get('*/api/menus', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: [mockMenu],
    });
  }),
  http.get('*/api/menus/1', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: mockMenu,
    });
  }),
  http.post('*/api/menus', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: { ...mockMenu, id: 2, name: '新菜单' },
    });
  }),
  http.put('*/api/menus/1', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: { ...mockMenu, name: '已更新' },
    });
  }),
  http.delete('*/api/menus/1', () => {
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

describe('menuApi', () => {
  it('getAllMenus 应该获取所有菜单树', async () => {
    const result = await menuApi.getAllMenus();
    expect(result).toEqual([mockMenu]);
  });

  it('getMenus 应该获取当前用户菜单', async () => {
    const result = await menuApi.getMenus();
    expect(result).toEqual([mockMenu]);
  });

  it('getMenu 应该获取指定菜单', async () => {
    const result = await menuApi.getMenu(1);
    expect(result).toEqual(mockMenu);
  });

  it('createMenu 应该创建新菜单', async () => {
    const result = await menuApi.createMenu({
      name: '新菜单',
      type: 'catalog',
    });
    expect(result).toEqual(
      expect.objectContaining({ name: '新菜单' }),
    );
  });

  it('updateMenu 应该更新菜单', async () => {
    const result = await menuApi.updateMenu(1, { name: '已更新' });
    expect(result).toEqual(
      expect.objectContaining({ name: '已更新' }),
    );
  });

  it('deleteMenu 应该删除菜单', async () => {
    let deleteCalled = false;
    server.use(
      http.delete('*/api/menus/1', () => {
        deleteCalled = true;
        return HttpResponse.json({
          code: 0,
          message: 'success',
          data: null,
        });
      }),
    );

    await menuApi.deleteMenu(1);
    expect(deleteCalled).toBe(true);
  });
});
