import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import UserListPage from '../pages/UserListPage';
import userReducer from '../slice';
import roleReducer from '@/modules/role/slice';
import authReducer from '@/modules/auth/slice';
import menuReducer from '@/modules/menu/slice';
import { adminApi } from '@/services/adminApi';

vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, permissions: [] }),
}));

vi.mock('@/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      user: { list: [], meta: null, loading: false, error: null },
      role: { list: [], meta: null, loading: false, error: null },
      auth: {
        user: { id: 1, name: 'Admin', email: 'admin@test.com', avatar: null, status: true, expires_at: null, remarks: null, created_at: '', updated_at: '', roles: [] },
        permissions: [],
        userMenus: [],
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    }),
  usePagination: () => ({
    current: 1,
    pageSize: 15,
    onChange: vi.fn(),
    reset: vi.fn(),
    getPaginationConfig: vi.fn(() => ({
      current: 1,
      pageSize: 15,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: vi.fn(),
      onChange: vi.fn(),
    })),
  }),
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      role: roleReducer,
      auth: authReducer,
      menu: menuReducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(adminApi.middleware),
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('UserListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    renderWithProviders(<UserListPage />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });

  it('renders search form', () => {
    renderWithProviders(<UserListPage />);
    expect(screen.getByPlaceholderText('姓名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('邮箱')).toBeInTheDocument();
  });

  it('renders add user button', () => {
    renderWithProviders(<UserListPage />);
    expect(screen.getByText('新增用户')).toBeInTheDocument();
  });

  it('renders search and reset buttons', () => {
    renderWithProviders(<UserListPage />);
    expect(screen.getByText('搜索')).toBeInTheDocument();
    expect(screen.getByText('重置')).toBeInTheDocument();
  });
});
