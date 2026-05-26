import { describe, it, expect, vi, beforeEach } from 'vitest';
import menuReducer, {
  clearMenuError,
  fetchAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../slice';
import type { MenuState } from '../types';
import type { MenuTree } from '@/types/menu';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('menuSlice', () => {
  const initialState: MenuState = {
    allMenus: [],
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回正确的初始状态', () => {
    const state = menuReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('clearMenuError 应该清除错误状态', () => {
    const stateWithError: MenuState = {
      ...initialState,
      error: '测试错误',
    };
    const result = menuReducer(stateWithError, clearMenuError());
    expect(result.error).toBeNull();
  });

  it('fetchAllMenus.pending 应该设置 loading 并清除 error', () => {
    const stateWithError: MenuState = {
      ...initialState,
      error: '旧错误',
      loading: false,
    };
    const action = { type: fetchAllMenus.pending.type, payload: undefined };
    const result = menuReducer(stateWithError, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('fetchAllMenus.fulfilled 应该设置 allMenus', () => {
    const menus: MenuTree[] = [
      {
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
      },
    ];
    const action = { type: fetchAllMenus.fulfilled.type, payload: menus };
    const result = menuReducer(
      { ...initialState, loading: true },
      action,
    );
    expect(result.loading).toBe(false);
    expect(result.allMenus).toEqual(menus);
  });

  it('fetchAllMenus.rejected 应该设置 error', () => {
    const action = {
      type: fetchAllMenus.rejected.type,
      payload: '获取菜单失败',
    };
    const result = menuReducer(
      { ...initialState, loading: true },
      action,
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('获取菜单失败');
  });

  it('createMenu.rejected 应该设置 error', () => {
    const action = {
      type: createMenu.rejected.type,
      payload: '创建失败',
    };
    const result = menuReducer(initialState, action);
    expect(result.error).toBe('创建失败');
  });

  it('updateMenu.rejected 应该设置 error', () => {
    const action = {
      type: updateMenu.rejected.type,
      payload: '更新失败',
    };
    const result = menuReducer(initialState, action);
    expect(result.error).toBe('更新失败');
  });

  it('deleteMenu.rejected 应该设置 error', () => {
    const action = {
      type: deleteMenu.rejected.type,
      payload: '删除失败',
    };
    const result = menuReducer(initialState, action);
    expect(result.error).toBe('删除失败');
  });
});
