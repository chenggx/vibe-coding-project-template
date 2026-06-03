import { useMemo, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Form,
  Input,
} from 'antd';
import type { FormProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAppSelector, usePagination, useCrudTable, useResponsive } from '@/hooks';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionWrapper from '@/components/common/PermissionWrapper';
import FadeIn from '@/components/common/FadeIn';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from '@/services/adminApi';
import UserFormModal from '../components/UserFormModal';
import RoleTag from '../components/RoleTag';
import type { User } from '../types';

interface SearchValues {
  name?: string;
  email?: string;
}

export default function UserListPage() {
  const { isMobile } = useResponsive();
  const currentUser = useAppSelector((state) => state.auth.user);
  const pagination = usePagination();
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [formKey, setFormKey] = useState(0);
  const { modalOpen, editingItem, handleAdd, handleEdit, handleDelete, setModalOpen } =
    useCrudTable<User>();

  const { current: page, pageSize } = pagination;

  const params = useMemo(
    () => ({
      ...searchValues,
      page,
      per_page: pageSize,
    }),
    [searchValues, page, pageSize],
  );

  const { data, isLoading, refetch } = useGetUsersQuery(params, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteUser] = useDeleteUserMutation();

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  const handleSearch: FormProps<SearchValues>['onFinish'] = (values) => {
    pagination.reset();
    setSearchValues(values);
    setTimeout(() => refetch(), 0);
  };

  const handleReset = () => {
    setSearchValues({});
    pagination.reset();
    setFormKey((k) => k + 1);
  };

  const columns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      {
        title: '角色',
        key: 'roles',
        render: (_: unknown, record: User) => <RoleTag roles={record.roles} />,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        render: (v: string) =>
          v
            ? new Date(v).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
            : '-',
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
        render: (_: unknown, record: User) => (
          <Space>
            <PermissionWrapper permission="users.update">
              <Button size="small" onClick={() => handleEdit(record)}>
                编辑
              </Button>
            </PermissionWrapper>
            {currentUser && currentUser.id !== record.id && (
              <PermissionWrapper permission="users.destroy">
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    handleDelete({
                      item: record,
                      onConfirm: async (id) => {
                        await deleteUser(id).unwrap();
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
    [currentUser, handleEdit, handleDelete, deleteUser],
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
      <Card style={{ marginBottom: 16, background: 'var(--color-bg-card)' }}>
        <Form
          key={formKey}
          layout={isMobile ? 'vertical' : 'inline'}
          style={
            isMobile
              ? { marginBottom: 0 }
              : { flexWrap: 'wrap', gap: '8px 16px' }
          }
          onFinish={handleSearch}
        >
          <Form.Item
            name="name"
            label={isMobile ? '姓名' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="姓名" allowClear />
          </Form.Item>
          <Form.Item
            name="email"
            label={isMobile ? '邮箱' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="邮箱" allowClear />
          </Form.Item>
          <Form.Item
            style={{
              marginBottom: 0,
              textAlign: isMobile ? 'right' : undefined,
            }}
          >
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                htmlType="submit"
              >
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="用户管理"
        style={{ background: 'var(--color-bg-card)' }}
        extra={
          <PermissionButton
            type="primary"
            icon={<PlusOutlined />}
            permission="users.store"
            onClick={handleAdd}
          >
            新增用户
          </PermissionButton>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={isLoading}
          pagination={paginationConfig}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <UserFormModal
        open={modalOpen}
        user={editingItem}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </FadeIn>
  );
}
