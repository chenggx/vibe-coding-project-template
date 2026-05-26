import { describe, it, expect, vi, beforeEach } from 'vitest';
import reducer, {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  clearUserError,
  setCurrentUser,
} from '../slice';
import type { UserState } from '../types';

vi.mock('../api', () => ({
  userApi: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const initialState: UserState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  currentUser: null,
};

const mockUser = {
  id: 1,
  name: '测试用户',
  email: 'test@example.com',
  avatar: null,
  status: true,
  expires_at: null,
  remarks: null,
  is_super_admin: false,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  roles: [],
};

describe('userSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearUserError', () => {
    const stateWithError = { ...initialState, error: 'some error' };
    expect(reducer(stateWithError, clearUserError())).toEqual({
      ...initialState,
      error: null,
    });
  });

  it('should handle setCurrentUser', () => {
    const state = reducer(initialState, setCurrentUser(mockUser));
    expect(state.currentUser).toEqual(mockUser);
  });

  it('should handle setCurrentUser with null', () => {
    const stateWithUser = { ...initialState, currentUser: mockUser };
    const state = reducer(stateWithUser, setCurrentUser(null));
    expect(state.currentUser).toBeNull();
  });

  describe('fetchUsers', () => {
    it('should set loading on pending', () => {
      const action = { type: fetchUsers.pending.type };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set list and meta on fulfilled', () => {
      const payload = {
        data: [mockUser],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 1,
        },
      };
      const action = { type: fetchUsers.fulfilled.type, payload };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.list).toEqual([mockUser]);
      expect(state.meta).toEqual(payload.meta);
    });

    it('should set error on rejected', () => {
      const action = {
        type: fetchUsers.rejected.type,
        payload: '获取用户列表失败',
      };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('获取用户列表失败');
    });
  });

  describe('createUser', () => {
    it('should set error on rejected', () => {
      const action = {
        type: createUser.rejected.type,
        payload: '创建失败',
      };
      const state = reducer(initialState, action);
      expect(state.error).toBe('创建失败');
    });
  });

  describe('updateUser', () => {
    it('should set error on rejected', () => {
      const action = {
        type: updateUser.rejected.type,
        payload: '更新失败',
      };
      const state = reducer(initialState, action);
      expect(state.error).toBe('更新失败');
    });
  });

  describe('deleteUser', () => {
    it('should set error on rejected', () => {
      const action = {
        type: deleteUser.rejected.type,
        payload: '删除失败',
      };
      const state = reducer(initialState, action);
      expect(state.error).toBe('删除失败');
    });
  });
});
