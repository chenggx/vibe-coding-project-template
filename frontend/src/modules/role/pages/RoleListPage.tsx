import { useMemo } from 'react';
import { Card, Button, Table, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppSelector, usePagination, useCrudTable } from '@/hooks';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionWrapper from '@/components/common/PermissionWrapper';
import FadeIn from '@/components/common/FadeIn';
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
  useGetRoleQuery,
} from '@/services/adminApi';
import RoleFormModal from '../components/RoleFormModal';
import type { Role } from '../types';

export default function RoleListPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const pagination = usePagination();
  const { modalOpen, editingItem, handleAdd, handleEdit, handleDelete, setModalOpen } =
    useCrudTable<Role>();

  const { current: page, pageSize } = pagination;

  const { data, isLoading } = useGetRolesQuery({ page, per_page: pageSize });
  const [deleteRole] = useDeleteRoleMutation();

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  const { data: editingRoleDetail } = useGetRoleQuery(editingItem?.id ?? 0, {
    skip: !editingItem,
  });

  const roleForModal = editingItem
    ? { ...editingItem, ...(editingRoleDetail ?? {}) }
    : null;

  const columns = useMemo(
    () => [
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
            {currentUser && currentUser.id !== record.id && (
              <PermissionWrapper permission="roles.destroy">
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    handleDelete({
                      item: record,
                      onConfirm: async (id) => {
                        await deleteRole(id).unwrap();
                      },
                    })
                  }
                >
                  删除
                </Button>
              </PermissionWrapper>
            )}
          </Space>
        ),
      },
    ],
    [currentUser, handleEdit, handleDelete, deleteRole],
  );

  const paginationConfig = useMemo(
    () =>
      meta
        ? {
            ...pagination.getPaginationConfig(meta),
            placement: ['bottomCenter'] as const,
          }
        : false,
    [meta, pagination],
  );

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
          loading={isLoading}
          pagination={paginationConfig}
        />
      </Card>
      <RoleFormModal
        open={modalOpen}
        role={roleForModal}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </FadeIn>
  );
}
