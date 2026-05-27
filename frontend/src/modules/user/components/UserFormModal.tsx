import { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, DatePicker, message } from 'antd';
import { useAppDispatch, useAppSelector, usePermission } from '@/hooks';
import { createUser, updateUser } from '../slice';
import { fetchRoles } from '@/modules/role/slice';
import ImageUploader from '@/components/common/ImageUploader';
import dayjs from 'dayjs';
import type { User, CreateUserDto } from '../types';

interface UserFormModalProps {
  open: boolean;
  user: User | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({ open, user, onCancel, onSuccess }: UserFormModalProps) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { list: roles } = useAppSelector((state) => state.role);
  const { hasPermission } = usePermission();

  useEffect(() => {
    if (open && hasPermission('roles.index')) {
      dispatch(fetchRoles({ per_page: 100 }));
    }
  }, [open, dispatch, hasPermission]);

  useEffect(() => {
    if (open) {
      if (user) {
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          expires_at: user.expires_at ? dayjs(user.expires_at) : null,
          remarks: user.remarks,
          role_ids: user.roles[0]?.id,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: true });
      }
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateUserDto = {
        name: values.name,
        email: values.email,
        password: values.password || '',
        avatar: values.avatar ?? undefined,
        status: values.status,
        expires_at: values.expires_at ? values.expires_at.format('YYYY-MM-DD') : undefined,
        remarks: values.remarks || undefined,
      };
      if (hasPermission('roles.index')) {
        dto.role_ids = values.role_ids !== undefined ? [values.role_ids] : [];
      }

      if (user) {
        const updateDto = { ...dto };
        if (!updateDto.password) delete updateDto.password;
        await dispatch(updateUser({ id: user.id, data: updateDto })).unwrap();
        message.success('更新成功');
      } else {
        await dispatch(createUser(dto)).unwrap();
        message.success('创建成功');
      }
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return;
      }
      const errorMsg = typeof err === 'string' ? err : err instanceof Error ? err.message : '操作失败';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      title={user ? '编辑用户' : '新增用户'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" initialValues={{ status: true }}>
        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}>
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={user ? [] : [{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
        >
          <Input.Password placeholder={user ? '留空则不修改密码' : '请输入密码'} />
        </Form.Item>
        <Form.Item name="avatar" label="头像">
          <ImageUploader />
        </Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="expires_at" label="过期时间">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="remarks" label="备注">
          <Input.TextArea rows={3} placeholder="备注" />
        </Form.Item>
        {hasPermission('roles.index') && (
          <Form.Item name="role_ids" label="角色">
            <Select
              placeholder="选择角色"
              options={roles.map((r) => ({ label: r.display_name, value: r.id }))}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
