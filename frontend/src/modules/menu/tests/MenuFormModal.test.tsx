import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MenuFormModal from '../components/MenuFormModal';
import menuReducer from '../slice';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => 'test-token'),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

vi.mock('../slice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../slice')>();
  return {
    ...actual,
    createMenu: vi.fn(() => ({ type: 'menu/createMenu' })),
    updateMenu: vi.fn(() => ({ type: 'menu/updateMenu' })),
  };
});

function createTestStore() {
  return configureStore({
    reducer: { menu: menuReducer },
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

describe('MenuFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新增模式下应该渲染正确的标题', async () => {
    renderWithProviders(
      <MenuFormModal
        open={true}
        menu={null}
        allMenus={[]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('新增菜单')).toBeInTheDocument();
    });
  });

  it('编辑模式下应该渲染正确的标题', async () => {
    const menu = {
      id: 1,
      parent_id: null,
      name: '用户管理',
      type: 'menu' as const,
      path: '/users',
      icon: 'UserOutlined',
      permission: 'user.view',
      sort_order: 1,
      meta: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      children: [],
    };

    renderWithProviders(
      <MenuFormModal
        open={true}
        menu={menu}
        allMenus={[]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('编辑菜单')).toBeInTheDocument();
    });
  });

  it('应该渲染所有表单字段标签', async () => {
    renderWithProviders(
      <MenuFormModal
        open={true}
        menu={null}
        allMenus={[]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('上级菜单')).toBeInTheDocument();
    });
    expect(screen.getByText('菜单名称')).toBeInTheDocument();
    expect(screen.getByText('类型')).toBeInTheDocument();
    expect(screen.getByText('排序')).toBeInTheDocument();
  });

  it('默认类型为 menu 时应该显示路径和权限标识字段', async () => {
    renderWithProviders(
      <MenuFormModal
        open={true}
        menu={null}
        allMenus={[]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText('路径')).toBeInTheDocument();
    });
    expect(screen.getByText('权限标识')).toBeInTheDocument();
  });

  it('切换到 catalog 类型时应该隐藏路径和权限标识', async () => {
    renderWithProviders(
      <MenuFormModal
        open={true}
        menu={null}
        allMenus={[]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('路径')).toBeInTheDocument();
    });

    const catalogBtn = screen.getByRole('radio', { name: '目录' });
    fireEvent.click(catalogBtn);

    await waitFor(() => {
      expect(screen.queryByText('路径')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('权限标识')).not.toBeInTheDocument();
  });

  it('切换到 permission 类型时应该隐藏路径和图标', async () => {
    renderWithProviders(
      <MenuFormModal
        open={true}
        menu={null}
        allMenus={[]}
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('路径')).toBeInTheDocument();
    });

    const permissionBtn = screen.getByRole('radio', { name: '权限点' });
    fireEvent.click(permissionBtn);

    await waitFor(() => {
      expect(screen.queryByText('路径')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('图标')).not.toBeInTheDocument();
    expect(screen.getByText('权限标识')).toBeInTheDocument();
  });
});
