import { Button, Space, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import UserDropdown from '@/modules/auth/components/UserDropdown';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setThemeMode } from '@/modules/theme/slice';
import type { ThemeMode } from '@/modules/theme/types';

interface HeaderProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDrawer: () => void;
}

const modeOrder: ThemeMode[] = ['light', 'dark', 'system'];

const modeIcon = {
  light: <SunOutlined />,
  dark: <MoonOutlined />,
  system: <DesktopOutlined />,
};

const modeTooltip = {
  light: '切换为明亮模式',
  dark: '切换为暗黑模式',
  system: '跟随系统',
};

export default function Header({
  isMobile,
  collapsed,
  onToggleCollapse,
  onOpenDrawer,
}: HeaderProps) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  const handleToggleTheme = () => {
    const nextIndex = (modeOrder.indexOf(mode) + 1) % modeOrder.length;
    dispatch(setThemeMode(modeOrder[nextIndex]));
  };

  return (
    <div
      style={{
        height: 64,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-bg-page)',
        borderBottom: 'none',
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
      <Space>
        <Tooltip title={modeTooltip[mode]}>
          <Button
            type="text"
            icon={modeIcon[mode]}
            onClick={handleToggleTheme}
          />
        </Tooltip>
        <UserDropdown />
      </Space>
    </div>
  );
}
