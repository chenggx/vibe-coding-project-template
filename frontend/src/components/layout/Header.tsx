import { Button, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import UserDropdown from '@/modules/auth/components/UserDropdown';

interface HeaderProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDrawer: () => void;
}

export default function Header({
  isMobile,
  collapsed,
  onToggleCollapse,
  onOpenDrawer,
}: HeaderProps) {
  return (
    <div
      style={{
        height: 64,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Space>
        {isMobile ? (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onOpenDrawer}
          />
        ) : (
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={onToggleCollapse}
          />
        )}
      </Space>
      <UserDropdown />
    </div>
  );
}
