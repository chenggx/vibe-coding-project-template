import { useMemo, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Switch,
  Form,
  Input,
} from 'antd';
import type { FormProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAppSelector, usePagination, useCrudTable } from '@/hooks';
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

  const { data, isLoading } = useGetUsersQuery(params);
  const [deleteUser] = useDeleteUserMutation();

  const list = data?.data ?? [];
  const meta = data?.meta ?? null;

  const handleSearch: FormProps<SearchValues>['onFinish'] = (values) => {
    pagination.reset();
    setSearchValues(values);
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
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status: boolean) => (
          <Switch checked={status} size="small" disabled />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 120,
        render: (v: string) => (v ? new Date(v).toLocaleDateString() : '-'),
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
        <Form key={formKey} layout="inline" style={{ marginBottom: 0 }} onFinish={handleSearch}>
          <Form.Item name="name">
            <Input placeholder="姓名" allowClear />
          </Form.Item>
          <Form.Item name="email">
            <Input placeholder="邮箱" allowClear />
          </Form.Item>
          <Form.Item>
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
