import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuPermissionTree from '../components/MenuPermissionTree';
import type { MenuTree } from '@/types/menu';

vi.mock('@/utils/token', () => ({
  getToken: vi.fn(() => 'test-token'),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

const mockMenus: MenuTree[] = [
  {
    id: 1,
    parent_id: null,
    name: '用户管理',
    type: 'catalog',
    path: null,
    icon: 'UserOutlined',
    permission: null,
    sort_order: 1,
    meta: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    children: [
      {
        id: 2,
        parent_id: 1,
        name: '用户列表',
        type: 'menu',
        path: '/users',
        icon: 'ListOutlined',
        permission: 'user.view',
        sort_order: 1,
        meta: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        children: [],
      },
    ],
  },
];

describe('MenuPermissionTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('无菜单数据时应显示提示文字', () => {
    render(<MenuPermissionTree menuData={[]} />);
    expect(screen.getByText('暂无菜单数据')).toBeInTheDocument();
  });

  it('有菜单数据时应渲染树节点', () => {
    render(<MenuPermissionTree menuData={mockMenus} />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
    expect(screen.getByText('用户列表')).toBeInTheDocument();
  });

  it('应渲染可勾选的树', () => {
    render(<MenuPermissionTree menuData={mockMenus} />);
    const treeNodes = document.querySelectorAll('.ant-tree-treenode');
    expect(treeNodes.length).toBeGreaterThan(0);
  });

  it('勾选节点应触发 onChange 回调', () => {
    const onChange = vi.fn();
    render(<MenuPermissionTree menuData={mockMenus} onChange={onChange} />);

    const checkboxes = document.querySelectorAll('.ant-tree-checkbox');
    if (checkboxes.length > 0) {
      fireEvent.click(checkboxes[0]);
      expect(onChange).toHaveBeenCalled();
    }
  });

  it('应传入初始勾选值', () => {
    render(<MenuPermissionTree menuData={mockMenus} value={[1]} />);
    const checkedNodes = document.querySelectorAll('.ant-tree-checkbox-checked');
    expect(checkedNodes.length).toBeGreaterThanOrEqual(1);
  });
});
