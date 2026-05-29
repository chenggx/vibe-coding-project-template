import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils';
import UserListPage from '../pages/UserListPage';

vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, permissions: [] }),
}));

vi.mock('@/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      auth: {
        user: { id: 1, name: 'Admin', email: 'admin@test.com', avatar: null, status: true, expires_at: null, remarks: null, created_at: '', updated_at: '', roles: [] },
        permissions: [],
        userMenus: [],
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    }),
  usePermission: () => ({ hasPermission: () => true, permissions: [] }),
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
  useCrudTable: () => ({
    modalOpen: false,
    editingItem: null,
    handleAdd: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
    setModalOpen: vi.fn(),
    setEditingItem: vi.fn(),
  }),
  useResponsive: () => ({ isMobile: false, isDesktop: true, isXs: false, isSm: false, isMd: false, isLg: true, isXl: true, isXxl: true }),
}));

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
