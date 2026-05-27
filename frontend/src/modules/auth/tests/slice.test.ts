import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
  resetAuth,
  clearError,
  login,
  fetchCurrentUser,
} from '../slice';
import type { AuthState } from '../types';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

describe('authSlice', () => {
  const initialState: AuthState = {
    token: null,
    user: null,
    permissions: [],
    userMenus: [],
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回正确的初始状态', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('clearError 应该清除错误状态', () => {
    const stateWithError: AuthState = { ...initialState, error: '测试错误' };
    const result = authReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
  });

  it('resetAuth 应该重置所有状态', () => {
    const dirtyState: AuthState = {
      token: 'test-token',
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        avatar: null,
        status: true,
        expires_at: null,
        remarks: null,
        is_super_admin: true,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        roles: [],
      },
      permissions: ['user.create'],
      userMenus: [],
      isAuthenticated: true,
      loading: true,
      error: 'some error',
    };
    const result = authReducer(dirtyState, resetAuth());
    expect(result).toEqual(initialState);
  });

  it('login.pending 应该设置 loading 并清除 error', () => {
    const stateWithError: AuthState = {
      ...initialState,
      error: '旧错误',
      loading: false,
    };
    const action = { type: login.pending.type, payload: undefined };
    const result = authReducer(stateWithError, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('login.fulfilled 应该设置 token 和 isAuthenticated', () => {
    const payload = {
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        avatar: null,
        status: true,
        expires_at: null,
        remarks: null,
        is_super_admin: true,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        roles: [],
      },
      token: 'test-token-123',
    };
    const action = { type: login.fulfilled.type, payload };
    const result = authReducer(initialState, action);
    expect(result.loading).toBe(false);
    expect(result.token).toBe('test-token-123');
    expect(result.isAuthenticated).toBe(true);
  });

  it('login.rejected 应该设置 error', () => {
    const action = {
      type: login.rejected.type,
      payload: '登录失败',
    };
    const result = authReducer(
      { ...initialState, loading: true },
      action,
    );
    expect(result.loading).toBe(false);
    expect(result.error).toBe('登录失败');
  });

  it('fetchCurrentUser.fulfilled 应该设置 user、permissions 和 userMenus', () => {
    const payload = {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      avatar: null,
      status: true,
      expires_at: null,
      remarks: null,
      is_super_admin: true,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      roles: [
        {
          id: 1,
          name: 'super-admin',
          display_name: '超级管理员',
          description: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ],
      menus: [
        {
          id: 1,
          parent_id: null,
          name: '用户管理',
          type: 'menu' as const,
          path: '/users',
          icon: 'UserOutlined',
          permission: 'user.view',
          sort_order: 1,
          meta: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          children: [],
        },
      ],
    };
    const action = { type: fetchCurrentUser.fulfilled.type, payload };
    const result = authReducer(
      { ...initialState, loading: true },
      action,
    );
    expect(result.loading).toBe(false);
    expect(result.user).toBeDefined();
    expect(result.user?.name).toBe('Admin');
    expect(result.user?.roles).toEqual(payload.roles);
    expect(result.permissions).toEqual(['user.view']);
    expect(result.userMenus).toEqual(payload.menus);
    expect(result.isAuthenticated).toBe(true);
  });

  it('fetchCurrentUser.rejected 应该清除认证状态', () => {
    const authedState: AuthState = {
      ...initialState,
      token: 'test-token',
      isAuthenticated: true,
      loading: true,
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@test.com',
        avatar: null,
        status: true,
        expires_at: null,
        remarks: null,
        is_super_admin: true,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        roles: [],
      },
      permissions: ['user.view'],
      userMenus: [
        {
          id: 1,
          parent_id: null,
          name: '用户管理',
          type: 'menu',
          path: '/users',
          icon: 'User',
          permission: 'user.view',
          sort_order: 1,
          meta: null,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
          children: [],
        },
      ],
    };
    const action = {
      type: fetchCurrentUser.rejected.type,
      payload: '获取用户信息失败',
    };
    const result = authReducer(authedState, action);
    expect(result.loading).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
    expect(result.permissions).toEqual([]);
    expect(result.userMenus).toEqual([]);
    expect(result.error).toBe('获取用户信息失败');
  });
});
