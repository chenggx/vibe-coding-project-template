import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils';
import DashboardPage from '../pages/DashboardPage';

describe('DashboardPage', () => {
  it('应该渲染欢迎语', () => {
    renderWithProviders(<DashboardPage />, {
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Admin' },
          isAuthenticated: true,
          permissions: [],
          userMenus: [],
        },
      },
    });
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });

  it('应该渲染统计卡片', () => {
    renderWithProviders(<DashboardPage />, {
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Admin' },
          isAuthenticated: true,
          permissions: [],
          userMenus: [],
        },
      },
    });
    expect(screen.getByText('总用户数')).toBeInTheDocument();
    expect(screen.getByText('总角色数')).toBeInTheDocument();
    expect(screen.getByText('总菜单数')).toBeInTheDocument();
  });

  it('应该渲染快捷操作', () => {
    renderWithProviders(<DashboardPage />, {
      preloadedState: {
        auth: {
          user: { id: 1, name: 'Admin' },
          isAuthenticated: true,
          permissions: [],
          userMenus: [],
        },
      },
    });
    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('角色管理')).toBeInTheDocument();
  });
});
