import { describe, it, expect, vi, beforeEach } from 'vitest';
import roleReducer, {
  clearRoleError,
  setCurrentRole,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../slice';
import type { RoleState } from '../types';
import type { Role } from '../types';

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('roleSlice', () => {
  const initialState: RoleState = {
    list: [],
    meta: null,
    loading: false,
    error: null,
    currentRole: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回正确的初始状态', () => {
    const state = roleReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('clearRoleError 应该清除错误状态', () => {
    const stateWithError: RoleState = {
      ...initialState,
      error: '测试错误',
    };
    const result = roleReducer(stateWithError, clearRoleError());
    expect(result.error).toBeNull();
  });

  it('setCurrentRole 应该设置当前角色', () => {
    const role: Role = {
      id: 1,
      name: 'admin',
      display_name: '管理员',
      description: '系统管理员',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    const result = roleReducer(initialState, setCurrentRole(role));
    expect(result.currentRole).toEqual(role);
  });

  it('setCurrentRole(null) 应该清除当前角色', () => {
    const stateWithRole: RoleState = {
      ...initialState,
      currentRole: {
        id: 1,
        name: 'admin',
        display_name: '管理员',
        description: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      },
    };
    const result = roleReducer(stateWithRole, setCurrentRole(null));
    expect(result.currentRole).toBeNull();
  });

  it('fetchRoles.pending 应该设置 loading 并清除 error', () => {
    const stateWithError: RoleState = {
      ...initialState,
      error: '旧错误',
      loading: false,
    };
    const action = { type: fetchRoles.pending.type, payload: undefined };
    const result = roleReducer(stateWithError, action);
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('fetchRoles.fulfilled 应该设置 list 和 meta', () => {
    const roles: Role[] = [
      {
        id: 1,
        name: 'admin',
        display_name: '管理员',
        description: '系统管理员',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        users_count: 5,
      },
    ];
    const meta = {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 1,
    };
    const action = {
      type: fetchRoles.fulfilled.type,
      payload: { data: roles, meta },
    };
    const result = roleReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.list).toEqual(roles);
    expect(result.meta).toEqual(meta);
  });

  it('fetchRoles.rejected 应该设置 error', () => {
    const action = {
      type: fetchRoles.rejected.type,
      payload: '获取角色列表失败',
    };
    const result = roleReducer({ ...initialState, loading: true }, action);
    expect(result.loading).toBe(false);
    expect(result.error).toBe('获取角色列表失败');
  });

  it('createRole.rejected 应该设置 error', () => {
    const action = {
      type: createRole.rejected.type,
      payload: '创建失败',
    };
    const result = roleReducer(initialState, action);
    expect(result.error).toBe('创建失败');
  });

  it('updateRole.rejected 应该设置 error', () => {
    const action = {
      type: updateRole.rejected.type,
      payload: '更新失败',
    };
    const result = roleReducer(initialState, action);
    expect(result.error).toBe('更新失败');
  });

  it('deleteRole.rejected 应该设置 error', () => {
    const action = {
      type: deleteRole.rejected.type,
      payload: '删除失败',
    };
    const result = roleReducer(initialState, action);
    expect(result.error).toBe('删除失败');
  });
});
