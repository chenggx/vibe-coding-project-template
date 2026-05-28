import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import RoleListPage from '../pages/RoleListPage';
import roleReducer from '../slice';
import authReducer from '@/modules/auth/slice';
import { adminApi } from '@/services/adminApi';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => 'test-token'),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

vi.mock('../slice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../slice')>();
  return {
    ...actual,
    fetchRoles: vi.fn(() => ({ type: 'role/fetchRoles' })),
  };
});

function createTestStore() {
  return configureStore({
    reducer: {
      role: roleReducer,
      auth: authReducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    preloadedState: {
      auth: {
        token: null,
        user: { id: 1, name: 'Admin', email: 'admin@test.com', avatar: null, status: true, expires_at: null, remarks: null, created_at: '', updated_at: '', roles: [] },
        permissions: [],
        userMenus: [],
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(adminApi.middleware),
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  store = createTestStore(),
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>,
    ),
  };
}

describe('RoleListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染角色管理标题', () => {
    renderWithProviders(<RoleListPage />);
    expect(screen.getByText('角色管理')).toBeInTheDocument();
  });

  it('应该渲染新增角色按钮', () => {
    renderWithProviders(<RoleListPage />);
    expect(screen.getByText('新增角色')).toBeInTheDocument();
  });

  it('应该渲染表格列标题', () => {
    renderWithProviders(<RoleListPage />);
    expect(screen.getByText('标识名')).toBeInTheDocument();
    expect(screen.getByText('显示名称')).toBeInTheDocument();
    expect(screen.getByText('描述')).toBeInTheDocument();
    expect(screen.getByText('关联用户数')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });
});
