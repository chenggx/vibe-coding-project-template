import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils';
import RoleListPage from '../pages/RoleListPage';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => 'test-token'),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, permissions: [] }),
}));

vi.mock('@/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      auth: {
        token: null,
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
}));

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
