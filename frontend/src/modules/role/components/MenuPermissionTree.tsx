import { useMemo, useCallback } from 'react';
import { Tree } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { MenuTree } from '@/types/menu';

interface MenuPermissionTreeProps {
  value?: number[];
  onChange?: (ids: number[]) => void;
  menuData: MenuTree[];
}

const iconMap: Record<string, React.ReactNode> = {
  catalog: <FolderOutlined />,
  menu: <FileOutlined />,
  permission: <KeyOutlined />,
};

function treeToTreeData(menus: MenuTree[]) {
  return menus.map((menu) => ({
    key: menu.id,
    title: menu.name,
    icon: iconMap[menu.type],
    children: menu.children?.length ? treeToTreeData(menu.children) : undefined,
  }));
}

export default function MenuPermissionTree({ value = [], onChange, menuData }: MenuPermissionTreeProps) {
  const treeData = useMemo(() => treeToTreeData(menuData), [menuData]);

  const handleCheck = useCallback(
    (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
      const keys = Array.isArray(checked) ? checked : checked.checked;
      onChange?.(keys as number[]);
    },
    [onChange],
  );

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 2, padding: 8, maxHeight: 300, overflow: 'auto' }}>
      {treeData.length > 0 ? (
        <Tree
          checkable
          checkStrictly={false}
          treeData={treeData}
          checkedKeys={value}
          onCheck={handleCheck}
          defaultExpandAll
        />
      ) : (
        <div style={{ color: '#999', textAlign: 'center', padding: 16 }}>暂无菜单数据</div>
      )}
    </div>
  );
}
