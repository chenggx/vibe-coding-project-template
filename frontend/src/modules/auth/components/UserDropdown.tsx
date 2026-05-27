import { useCallback } from 'react';
import { Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { logout } from '../slice';

export default function UserDropdown() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const menuItems = [
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
