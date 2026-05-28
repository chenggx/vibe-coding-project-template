import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPage from '../pages/DashboardPage';
import authReducer from '@/modules/auth/slice';
import { adminApi } from '@/services/adminApi';

function createTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    preloadedState: {
      auth: {
        user: { id: 1, name: 'Admin' },
        isAuthenticated: true,
        permissions: [],
        userMenus: [],
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(adminApi.middleware),
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
    expect(screen.getByText('总用户数')).toBeInTheDocument();
    expect(screen.getByText('总角色数')).toBeInTheDocument();
    expect(screen.getByText('总菜单数')).toBeInTheDocument();
  });

  it('应该渲染快捷操作', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('角色管理')).toBeInTheDocument();
  });
});
