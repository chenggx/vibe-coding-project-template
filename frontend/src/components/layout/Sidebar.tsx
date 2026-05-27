import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SafetyOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '@/hooks';
import type { MenuTree } from '@/types/menu';
import styles from './Sidebar.module.css';

const iconMap: Record<string, React.ReactNode> = {
  Setting: <SettingOutlined />,
  User: <UserOutlined />,
  Team: <TeamOutlined />,
  Menu: <MenuOutlined />,
  Shield: <SafetyOutlined />,
  Dashboard: <HomeOutlined />,
};

interface SidebarProps {
  collapsed: boolean;
}

function buildMenuItems(menus: MenuTree[]) {
  return menus
    .filter((m) => m.type !== 'permission')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((menu) => {
      const children = menu.children?.length
        ? buildMenuItems(menu.children)
        : [];
      return {
        key: menu.path || menu.id.toString(),
        icon: menu.icon ? iconMap[menu.icon] : undefined,
        label: menu.name,
        children: children.length > 0 ? children : undefined,
      };
    });
}

function findOpenKeys(menus: MenuTree[], path: string): string[] {
  for (const menu of menus) {
    if (menu.path === path) return [];
    if (menu.children?.length) {
      const childKeys = findOpenKeys(menu.children, path);
      if (childKeys.length > 0)
        return [menu.path || menu.id.toString(), ...childKeys];
    }
  }
  return [];
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userMenus } = useAppSelector((state) => state.auth);
  const [openKeys, setOpenKeys] = useState<string[]>(
    () => (collapsed ? [] : findOpenKeys(userMenus, location.pathname))
  );

  const menuItems = buildMenuItems(userMenus);

  useEffect(() => {
    if (collapsed) {
      setOpenKeys([]);
    } else {
      setOpenKeys(findOpenKeys(userMenus, location.pathname));
    }
  }, [collapsed, userMenus]);

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <div
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
    >
      <div className={styles.logo}>
        {collapsed ? 'A' : 'Admin'}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        openKeys={collapsed ? undefined : openKeys}
        items={menuItems}
        onClick={handleMenuClick}
        onOpenChange={handleOpenChange}
        inlineCollapsed={collapsed}
      />
    </div>
  );
}
