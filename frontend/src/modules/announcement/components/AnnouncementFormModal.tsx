import { useEffect } from 'react';
import { Modal, Form, Input, Switch, App } from 'antd';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from '@/services/adminApi';
import { getApiErrorMessage } from '@/utils/error';
import type { Announcement, CreateAnnouncementDto } from '../types';

interface AnnouncementFormModalProps {
  open: boolean;
  announcement: Announcement | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AnnouncementFormModal({
  open,
  announcement,
  onCancel,
  onSuccess,
}: AnnouncementFormModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();

  useEffect(() => {
    if (open) {
      if (announcement) {
        form.setFieldsValue({
          title: announcement.title,
          content: announcement.content,
          status: announcement.status,
          pinned: announcement.pinned,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: false, pinned: false });
      }
    }
  }, [open, announcement, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateAnnouncementDto = {
        title: values.title,
        content: values.content,
        status: values.status,
        pinned: values.pinned,
      };

      if (announcement) {
        await updateAnnouncement({ id: announcement.id, data: dto }).unwrap();
        message.success('更新成功');
      } else {
        await createAnnouncement(dto).unwrap();
        message.success('创建成功');
      }
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return;
      }
      message.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      title={announcement ? '编辑公告' : '新增公告'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
      width={800}
    >
      <Form form={form} layout="vertical" initialValues={{ status: false, pinned: false }}>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
          <ReactQuill theme="snow" placeholder="请输入公告内容" style={{ height: 200, marginBottom: 40 }} />
        </Form.Item>
        <Form.Item name="status" label="发布状态" valuePropName="checked">
          <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
        </Form.Item>
        <Form.Item name="pinned" label="置顶" valuePropName="checked">
          <Switch checkedChildren="置顶" unCheckedChildren="不置顶" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
