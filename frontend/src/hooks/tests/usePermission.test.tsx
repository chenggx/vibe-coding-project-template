import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '@/tests/utils';
import { usePermission } from '../usePermission';

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('usePermission', () => {
  it('超级管理员应始终返回 true', () => {
    const store = createTestStore({
      auth: { user: { id: 1 }, permissions: [] },
    });
    const { result } = renderHook(() => usePermission(), {
      wrapper: createWrapper(store),
    });
    expect(
      result.current.hasPermission('any.permission'),
    ).toBe(true);
  });

  it('普通用户应按权限数组判断', () => {
    const store = createTestStore({
      auth: { user: { id: 2 }, permissions: ['users.index', 'users.create'] },
    });
    const { result } = renderHook(() => usePermission(), {
      wrapper: createWrapper(store),
    });
    expect(result.current.hasPermission('users.index')).toBe(
      true,
    );
    expect(
      result.current.hasPermission('users.delete'),
    ).toBe(false);
  });

  it('未登录用户应返回 false', () => {
    const store = createTestStore({
      auth: { user: null, permissions: [] },
    });
    const { result } = renderHook(() => usePermission(), {
      wrapper: createWrapper(store),
    });
    expect(result.current.hasPermission('users.index')).toBe(
      false,
    );
  });
});
