import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Select,
  Space,
  Button,
} from 'antd';
import type { FormProps } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { usePagination, useResponsive } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import { useGetOperationLogsQuery } from '@/services/adminApi';

interface SearchValues {
  username?: string;
  action?: string;
  method?: string;
  path?: string;
}

const methodOptions = [
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

export default function OperationLogListPage() {
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

  const { data, isLoading, refetch } = useGetOperationLogsQuery(params);

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
        title: '操作人',
        dataIndex: 'username',
        key: 'username',
        render: (v: string | null) => v ?? '-',
      },
      { title: '操作描述', dataIndex: 'action', key: 'action' },
      {
        title: 'HTTP 方法',
        dataIndex: 'method',
        key: 'method',
        width: 100,
      },
      { title: '请求路径', dataIndex: 'path', key: 'path' },
      {
        title: 'IP 地址',
        dataIndex: 'ip',
        key: 'ip',
        width: 120,
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
            name="username"
            label={isMobile ? '操作人' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="操作人" allowClear />
          </Form.Item>
          <Form.Item
            name="action"
            label={isMobile ? '操作描述' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="操作描述" allowClear />
          </Form.Item>
          <Form.Item
            name="method"
            label={isMobile ? '请求方法' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Select
              placeholder="请求方法"
              options={methodOptions}
              allowClear
              style={{ minWidth: 120 }}
            />
          </Form.Item>
          <Form.Item
            name="path"
            label={isMobile ? '请求路径' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="请求路径" allowClear />
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
        title="操作日志"
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
