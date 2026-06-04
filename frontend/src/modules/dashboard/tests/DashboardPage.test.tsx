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

  it('应该渲染系统公告和更新日志卡片', () => {
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
    expect(screen.getByText('系统公告')).toBeInTheDocument();
    expect(screen.getByText('更新日志')).toBeInTheDocument();
  });

  it('应该渲染更新日志内容', () => {
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
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });
});
