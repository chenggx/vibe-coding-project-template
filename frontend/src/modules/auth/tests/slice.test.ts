import { describe, it, expect, vi } from 'vitest';
import authReducer, {
  setToken,
  setUserAndPermissions,
  resetAuth,
  clearError,
} from '../slice';
import type { AuthState } from '../types';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

const initialState: AuthState = {
  token: null,
  user: null,
  permissions: [],
  userMenus: [],
  isAuthenticated: false,
  loading: false,
  error: null,
};

describe('auth reducer', () => {
  it('setToken should set token and isAuthenticated', () => {
    const state = authReducer(initialState, setToken('test-token'));
    expect(state.token).toBe('test-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUserAndPermissions should set user, menus, and permissions', () => {
    const payload = {
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      avatar: null,
      status: true,
      expires_at: null,
      remarks: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      roles: [],
      menus: [
        {
          id: 1,
          name: 'dashboard',
          path: '/dashboard',
          type: 'catalog' as const,
          title: '仪表盘',
          icon: 'dashboard',
          sort: 0,
          status: true,
          permission: 'dashboard.view',
          children: [],
        },
      ],
    };
    const state = authReducer(initialState, setUserAndPermissions(payload));
    expect(state.user).toEqual({
      id: 1,
      name: 'Admin',
      email: 'admin@test.com',
      avatar: null,
      status: true,
      expires_at: null,
      remarks: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      roles: [],
    });
    expect(state.userMenus).toEqual(payload.menus);
    expect(state.permissions.length).toBeGreaterThan(0);
    expect(state.loading).toBe(false);
  });

  it('resetAuth should restore initial state', () => {
    const modifiedState = authReducer(initialState, setToken('token'));
    const state = authReducer(modifiedState, resetAuth());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('clearError should clear error', () => {
    const errorState = { ...initialState, error: 'some error' };
    const state = authReducer(errorState, clearError());
    expect(state.error).toBeNull();
  });
});
