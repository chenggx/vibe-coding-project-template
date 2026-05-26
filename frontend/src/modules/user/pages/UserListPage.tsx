import { useEffect, useState } from 'react';
import { Card, Button, Table, Space, Switch, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector, usePagination } from '@/hooks';
import { fetchUsers, deleteUser } from '../slice';
import { fetchRoles } from '@/modules/role/slice';
import UserFormModal from '../components/UserFormModal';
import RoleTag from '../components/RoleTag';
import type { User } from '../types';

export default function UserListPage() {
  const dispatch = useAppDispatch();
  const { list, meta, loading } = useAppSelector((state) => state.user);
  const pagination = usePagination();
  const [searchForm] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { current: page, pageSize } = pagination;

  useEffect(() => {
    const values = searchForm.getFieldsValue();
    dispatch(fetchUsers({
      ...values,
      page,
      per_page: pageSize,
    }));
    dispatch(fetchRoles({ per_page: 100 }));
  }, [dispatch, searchForm, page, pageSize]);

  const handleSearch = () => {
    pagination.reset();
    const values = searchForm.getFieldsValue();
    dispatch(fetchUsers({
      ...values,
      page: 1,
      per_page: pagination.pageSize,
    }));
  };

  const handleReset = () => {
    searchForm.resetFields();
    pagination.reset();
    dispatch(fetchUsers({ page: 1, per_page: pagination.pageSize }));
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除用户「${user.name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteUser(user.id)).unwrap();
          message.success('删除成功');
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : '删除失败';
          message.error(errorMsg);
        }
      },
    });
  };

  const columns = [
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
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: User) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="用户管理" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="name">
            <Input placeholder="姓名" allowClear />
          </Form.Item>
          <Form.Item name="email">
            <Input placeholder="邮箱" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={meta ? pagination.getPaginationConfig(meta) : false}
        />
      </Card>

      <UserFormModal
        open={modalOpen}
        user={editingUser}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </div>
  );
}
