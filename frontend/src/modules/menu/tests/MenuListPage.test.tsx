import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MenuListPage from '../pages/MenuListPage';
import menuReducer from '../slice';
import authReducer from '@/modules/auth/slice';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => 'test-token'),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

vi.mock('../slice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../slice')>();
  return {
    ...actual,
    fetchAllMenus: vi.fn(() => ({ type: 'menu/fetchAllMenus' })),
  };
});

function createTestStore() {
  return configureStore({
    reducer: { menu: menuReducer, auth: authReducer },
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
      getDefaultMiddleware({ serializableCheck: false }),
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

describe('MenuListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染菜单管理标题', () => {
    renderWithProviders(<MenuListPage />);
    expect(screen.getByText('菜单管理')).toBeInTheDocument();
  });

  it('应该渲染新增菜单按钮', () => {
    renderWithProviders(<MenuListPage />);
    expect(screen.getByText('新增菜单')).toBeInTheDocument();
  });

  it('应该渲染表格列标题', () => {
    renderWithProviders(<MenuListPage />);
    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen.getByText('类型')).toBeInTheDocument();
    expect(screen.getByText('路径')).toBeInTheDocument();
    expect(screen.getByText('权限标识')).toBeInTheDocument();
    expect(screen.getByText('排序')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });
});
