import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/hooks';
import { useLogoutMutation } from '@/services/adminApi';

export default function UserDropdown() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {
      // ignore
    }
    navigate('/login', { state: { from: location } });
  }, [logout, navigate, location]);

  const menuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Space style={{ cursor: 'pointer' }}>
        <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} />
        <span>{user?.name ?? '未登录'}</span>
      </Space>
    </Dropdown>
  );
}
