import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from '../pages/DashboardPage';
import authReducer from '@/modules/auth/slice';

function createTestStore() {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: 1, name: 'Admin' },
        isAuthenticated: true,
        permissions: [],
        userMenus: [],
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{ui}</BrowserRouter>
    </Provider>,
  );
}

describe('DashboardPage', () => {
  it('应该渲染欢迎语', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });

  it('应该渲染统计卡片', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('用户总数')).toBeInTheDocument();
    expect(screen.getByText('角色数量')).toBeInTheDocument();
    expect(screen.getByText('菜单节点')).toBeInTheDocument();
    expect(screen.getByText('系统状态')).toBeInTheDocument();
  });

  it('应该渲染快捷操作', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('新增用户')).toBeInTheDocument();
    expect(screen.getByText('角色管理')).toBeInTheDocument();
  });
});
