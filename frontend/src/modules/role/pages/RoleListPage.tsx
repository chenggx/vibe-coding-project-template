import { useState } from 'react';
import { Card, Button, Table, Space, App } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector, usePagination } from '@/hooks';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionWrapper from '@/components/common/PermissionWrapper';
import FadeIn from '@/components/common/FadeIn';
import { fetchRoleDetail, deleteRole } from '../slice';
import { useGetAllMenusQuery } from '@/services/adminApi';
import RoleFormModal from '../components/RoleFormModal';
import type { Role } from '../types';

export default function RoleListPage() {
  const dispatch = useAppDispatch();
  const { list, meta, loading } = useAppSelector((state) => state.role);
  const { data: allMenus = [] } = useGetAllMenusQuery();
  const pagination = usePagination();
  const { message, modal } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleAdd = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleEdit = async (role: Role) => {
    try {
      const detail = await dispatch(fetchRoleDetail(role.id)).unwrap();
      setEditingRole(detail);
      setModalOpen(true);
    } catch (err: unknown) {
      const errorMsg =
        typeof err === 'string'
          ? err
          : err instanceof Error
            ? err.message
            : '获取角色详情失败';
      message.error(errorMsg);
    }
  };

  const handleDelete = (role: Role) => {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除角色「${role.display_name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteRole(role.id)).unwrap();
          message.success('删除成功');
        } catch (err: unknown) {
          const errorMsg =
            typeof err === 'string'
              ? err
              : err instanceof Error
                ? err.message
                : '删除失败';
          message.error(errorMsg);
        }
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标识名', dataIndex: 'name', key: 'name' },
    { title: '显示名称', dataIndex: 'display_name', key: 'display_name' },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (v: string | null) => v || '-',
    },
    {
      title: '关联用户数',
      dataIndex: 'users_count',
      key: 'users_count',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: Role) => (
        <Space>
          <PermissionWrapper permission="roles.update">
            <Button size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission="roles.destroy">
            <Button size="small" danger onClick={() => handleDelete(record)}>
              删除
            </Button>
          </PermissionWrapper>
        </Space>
      ),
    },
  ];

  return (
    <FadeIn stagger>
      <Card
        title="角色管理"
        style={{ background: 'var(--color-bg-card)' }}
        extra={
          <PermissionButton
            type="primary"
            icon={<PlusOutlined />}
            permission="roles.store"
            onClick={handleAdd}
          >
            新增角色
          </PermissionButton>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={
            meta
              ? {
                  ...pagination.getPaginationConfig(meta),
                  placement: ['bottomCenter'],
                }
              : false
          }
        />
      </Card>
      <RoleFormModal
        open={modalOpen}
        role={editingRole}
        allMenus={allMenus}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </FadeIn>
  );
}
