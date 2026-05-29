import { Modal, Tag, Space } from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import type { Announcement } from '../types';

interface AnnouncementDetailModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
}

export default function AnnouncementDetailModal({
  open,
  announcement,
  onClose,
}: AnnouncementDetailModalProps) {
  if (!announcement) return null;

  return (
    <Modal
      title={
        <Space>
          {announcement.pinned && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
          <span>{announcement.title}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Tag color={announcement.status ? 'success' : 'default'}>
            {announcement.status ? '已发布' : '草稿'}
          </Tag>
          <span style={{ fontSize: 12, color: '#999' }}>
            {new Date(announcement.created_at).toLocaleString()}
          </span>
        </Space>
      </div>
      <div
        className="ql-editor"
        style={{ padding: 0, minHeight: 100 }}
        dangerouslySetInnerHTML={{ __html: announcement.content }}
      />
    </Modal>
  );
}
