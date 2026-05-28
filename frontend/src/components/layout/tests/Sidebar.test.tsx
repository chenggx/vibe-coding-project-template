import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/utils';
import Sidebar from '../Sidebar';

const mockMenus = [
  {
    id: 1,
    parent_id: null,
    name: '仪表盘',
    type: 'menu' as const,
    path: '/dashboard',
    icon: 'Setting',
    permission: 'dashboard.index',
    sort_order: 1,
    meta: null,
    created_at: '2026-05-20',
    updated_at: '2026-05-20',
    children: [],
  },
  {
    id: 2,
    parent_id: null,
    name: '系统管理',
    type: 'catalog' as const,
    path: null,
    icon: 'Setting',
    permission: null,
    sort_order: 2,
    meta: null,
    created_at: '2026-05-20',
    updated_at: '2026-05-20',
    children: [
      {
        id: 3,
        parent_id: 2,
        name: '用户管理',
        type: 'menu' as const,
        path: '/users',
        icon: 'User',
        permission: 'users.index',
        sort_order: 1,
        meta: null,
        created_at: '2026-05-20',
        updated_at: '2026-05-20',
        children: [],
      },
      {
        id: 4,
        parent_id: 2,
        name: '角色管理',
        type: 'menu' as const,
        path: '/roles',
        icon: 'Team',
        permission: 'roles.index',
        sort_order: 2,
        meta: null,
        created_at: '2026-05-20',
        updated_at: '2026-05-20',
        children: [],
      },
    ],
  },
  {
    id: 5,
    parent_id: null,
    name: '权限详情',
    type: 'permission' as const,
    path: null,
    icon: null,
    permission: 'menus.view',
    sort_order: 3,
    meta: null,
    created_at: '2026-05-20',
    updated_at: '2026-05-20',
    children: [],
  },
];

describe('Sidebar', () => {
  it('应该渲染 Logo', () => {
    renderWithProviders(<Sidebar collapsed={false} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('折叠时应显示简短 Logo', () => {
    renderWithProviders(<Sidebar collapsed={true} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('应该渲染菜单项（过滤 permission 类型）', () => {
    renderWithProviders(<Sidebar collapsed={false} />, {
      preloadedState: {
        auth: {
          token: 'test-token',
          user: null,
          permissions: [],
          userMenus: mockMenus,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('系统管理')).toBeInTheDocument();
    expect(screen.queryByText('权限详情')).not.toBeInTheDocument();
  });

  it('应该渲染子菜单', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar collapsed={false} />, {
      preloadedState: {
        auth: {
          token: 'test-token',
          user: null,
          permissions: [],
          userMenus: mockMenus,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      },
    });
    await user.click(screen.getByText('系统管理'));
    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('角色管理')).toBeInTheDocument();
  });
});
