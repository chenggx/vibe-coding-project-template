import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Form,
  Input,
  Select,
  Tag,
} from 'antd';
import type { FormProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { usePagination, useCrudTable, useResponsive } from '@/hooks';
import PermissionButton from '@/components/common/PermissionButton';
import PermissionWrapper from '@/components/common/PermissionWrapper';
import FadeIn from '@/components/common/FadeIn';
import {
  useGetAnnouncementsQuery,
  useDeleteAnnouncementMutation,
} from '@/services/adminApi';
import AnnouncementFormModal from '../components/AnnouncementFormModal';
import AnnouncementDetailModal from '../components/AnnouncementDetailModal';
import type { Announcement } from '../types';

interface SearchValues {
  title?: string;
  status?: boolean;
}

export default function AnnouncementListPage() {
  const { isMobile } = useResponsive();
  const pagination = usePagination();
  const [form] = Form.useForm<SearchValues>();
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [formKey, setFormKey] = useState(0);
  const { modalOpen, editingItem, handleAdd, handleEdit, handleDelete, setModalOpen } =
    useCrudTable<Announcement>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);

  const handleOpenDetail = (item: Announcement) => {
    setDetailAnnouncement(item);
    setDetailOpen(true);
  };

  const { current: page, pageSize } = pagination;

  const params = useMemo(
    () => ({
      ...searchValues,
      page,
      per_page: pageSize,
    }),
    [searchValues, page, pageSize],
  );

  const { data, isLoading, refetch } = useGetAnnouncementsQuery(params);
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

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
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        render: (title: string, record: Announcement) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {record.pinned && <Tag color="red">置顶</Tag>}
            <span
              style={{
                cursor: 'pointer',
                maxWidth: 320,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
              title={title}
              onClick={() => handleOpenDetail(record)}
            >
              {title}
            </span>
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status: boolean) => (
          <Tag color={status ? 'success' : 'default'}>{status ? '已发布' : '草稿'}</Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 160,
        render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
        render: (_: unknown, record: Announcement) => (
          <Space>
            <PermissionWrapper permission="announcements.update">
              <Button size="small" onClick={() => handleEdit(record)}>
                编辑
              </Button>
            </PermissionWrapper>
            <PermissionWrapper permission="announcements.destroy">
              <Button
                size="small"
                danger
                onClick={() =>
                  handleDelete({
                    item: record,
                    onConfirm: async (id) => {
                      await deleteAnnouncement(id).unwrap();
                    },
                  })
                }
              >
                删除
              </Button>
            </PermissionWrapper>
          </Space>
        ),
      },
    ],
    [handleEdit, handleDelete, deleteAnnouncement, handleOpenDetail],
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
          form={form}
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
            name="title"
            label={isMobile ? '标题' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Input placeholder="标题" allowClear />
          </Form.Item>
          <Form.Item
            name="status"
            label={isMobile ? '状态' : undefined}
            style={{ marginBottom: isMobile ? 12 : 0 }}
          >
            <Select
              placeholder="状态"
              allowClear
              options={[
                { value: true, label: '已发布' },
                { value: false, label: '草稿' },
              ]}
              style={{ minWidth: 120 }}
            />
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
                onClick={() => form.submit()}
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
        title="公告管理"
        style={{ background: 'var(--color-bg-card)' }}
        extra={
          <PermissionButton
            type="primary"
            icon={<PlusOutlined />}
            permission="announcements.store"
            onClick={handleAdd}
          >
            新增公告
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

      <AnnouncementFormModal
        open={modalOpen}
        announcement={editingItem}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
      <AnnouncementDetailModal
        open={detailOpen}
        announcement={detailAnnouncement}
        onClose={() => setDetailOpen(false)}
      />
    </FadeIn>
  );
}
