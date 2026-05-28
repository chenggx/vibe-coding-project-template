import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserFormModal from '../components/UserFormModal';
import rootReducer from '@/app/rootReducer';
import { adminApi } from '@/services/adminApi';

vi.mock('@/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      role: { list: [], meta: null, loading: false, error: null },
    }),
  usePermission: () => ({ hasPermission: () => true }),
}));

vi.mock('@/components/common/ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">ImageUploader</div>,
}));

const createTestStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(adminApi.middleware),
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('UserFormModal', () => {
  const defaultProps = {
    open: true,
    user: null,
    onCancel: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create modal title', () => {
    renderWithProviders(<UserFormModal {...defaultProps} />);
    expect(screen.getByText('新增用户')).toBeInTheDocument();
  });

  it('renders edit modal title when user is provided', () => {
    const user = {
      id: 1,
      name: '测试用户',
      email: 'test@example.com',
      avatar: null,
      status: true,
      expires_at: null,
      remarks: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      roles: [],
    };
    renderWithProviders(<UserFormModal {...defaultProps} user={user} />);
    expect(screen.getByText('编辑用户')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    renderWithProviders(<UserFormModal {...defaultProps} />);
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByText('头像')).toBeInTheDocument();
    expect(screen.getByText('备注')).toBeInTheDocument();
    expect(screen.getByText('角色')).toBeInTheDocument();
  });

  it('renders image uploader', () => {
    renderWithProviders(<UserFormModal {...defaultProps} />);
    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });
});
