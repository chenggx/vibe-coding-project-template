import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Select,
  Space,
  Button,
  Tag,
} from 'antd';
import type { FormProps } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { usePagination, useResponsive } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import { useGetLoginLogsQuery } from '@/services/adminApi';

interface SearchValues {
  email?: string;
  name?: string;
  type?: 'login' | 'failed';
  browser?: string;
  os?: string;
  ip?: string;
  created_from?: string;
  created_to?: string;
}

const typeOptions = [
  { value: 'login', label: '成功' },
  { value: 'failed', label: '失败' },
];

export default function LoginLogListPage() {
  const { isMobile } = useResponsive();
  const pagination = usePagination();
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [formKey, setFormKey] = useState(0);

  const { current: page, pageSize } = pagination;

  const params = useMemo(
    () => ({
      ...searchValues,
      page,
      per_page: pageSize,
    }),
    [searchValues, page, pageSize],
  );

  const { data, isLoading, refetch } = useGetLoginLogsQuery(params);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '昵称',
        dataIndex: 'name',
        key: 'name',
        render: (v: string | null) => v ?? '-',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 80,
        render: (v: 'login' | 'failed') =>
          v === 'login' ? (
            <Tag color="success">成功</Tag>
          ) : (
            <Tag color="error">失败</Tag>
          ),
      },
      {
        title: '浏览器',
        dataIndex: 'browser',
        key: 'browser',
        width: 100,
        render: (v: string | null) => v ?? '-',
      },
      {
        title: '操作系统',
        dataIndex: 'os',
        key: 'os',
        width: 100,
        render: (v: string | null) => v ?? '-',
      },
      {
        title: 'IP 地址',
        dataIndex: 'ip',
        key: 'ip',
        width: 120,
        render: (v: string | null) => v ?? '-',
      },
      {
        title: '失败原因',
        dataIndex: 'message',
        key: 'message',
        render: (v: string | null) => v ?? '-',
      },
      {
        title: '操作时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 160,
        render: (v: string) => new Date(v).toLocaleString(),
      },
    ],
    [],
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
            name="email"
            label={isMobile ? '邮箱' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="邮箱" allowClear />
          </Form.Item>
          <Form.Item
            name="name"
            label={isMobile ? '昵称' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="昵称" allowClear />
          </Form.Item>
          <Form.Item
            name="type"
            label={isMobile ? '类型' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Select
              placeholder="类型"
              options={typeOptions}
              allowClear
              style={{ minWidth: 120 }}
            />
          </Form.Item>
          <Form.Item
            name="browser"
            label={isMobile ? '浏览器' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="浏览器" allowClear />
          </Form.Item>
          <Form.Item
            name="os"
            label={isMobile ? '操作系统' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="操作系统" allowClear />
          </Form.Item>
          <Form.Item
            name="ip"
            label={isMobile ? 'IP 地址' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="IP 地址" allowClear />
          </Form.Item>
          <Form.Item
            name="created_from"
            label={isMobile ? '开始日期' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="开始日期 (YYYY-MM-DD)" allowClear />
          </Form.Item>
          <Form.Item
            name="created_to"
            label={isMobile ? '结束日期' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="结束日期 (YYYY-MM-DD)" allowClear />
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
        title="登录日志"
        style={{ background: 'var(--color-bg-card)' }}
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
    </FadeIn>
  );
}
