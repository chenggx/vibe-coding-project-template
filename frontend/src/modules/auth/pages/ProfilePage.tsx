import { useEffect } from 'react';
import { Card, Form, Input, Button, Divider, Upload, App } from 'antd';
import { CameraOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { updateProfile } from '../slice';
import { handleApiError } from '@/services/errorHandler';
import { uploadApi } from '@/modules/upload/api';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({ name: user.name, avatar: user.avatar });
    }
  }, [user, form]);

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = (await uploadApi.uploadFile(file)) as unknown as { url: string };
      const currentName = form.getFieldValue('name') || user?.name || '';
      form.setFieldsValue({ avatar: result.url });
      await dispatch(updateProfile({ name: currentName, avatar: result.url })).unwrap();
      message.success('头像已更新');
    } catch (err) {
      handleApiError(err, message);
    }
    return false;
  };

  const handleSave = async (values: {
    name: string;
    avatar?: string;
    current_password?: string;
    password?: string;
    confirm_password?: string;
  }) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm_password: _, ...payload } = values;
      await dispatch(updateProfile(payload)).unwrap();
      message.success('保存成功');
      form.resetFields(['current_password', 'password', 'confirm_password']);
    } catch (err) {
      handleApiError(err, message);
    }
  };

  return (
    <Card title="个人资料">
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className={styles.avatarSection}>
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              handleAvatarUpload(file as unknown as File);
              return false;
            }}
            accept="image/jpeg,image/png,image/gif"
          >
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className={styles.avatarImg} />
                ) : (
                  <UserOutlined className={styles.avatarPlaceholder} />
                )}
              </div>
              <div className={styles.overlay}>
                <CameraOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
            </div>
          </Upload>
          <div className={styles.hint}>点击修改头像</div>
        </div>

        <Divider className={styles.divider} />

        <Form.Item
          name="name"
          label="名字"
          rules={[{ required: true, message: '请输入名字' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="邮箱">
          <Input value={user?.email} disabled />
        </Form.Item>

        <Divider />

        <Form.Item name="current_password" label="当前密码">
          <Input.Password placeholder="不修改请留空" />
        </Form.Item>
        <Form.Item
          name="password"
          label="新密码"
          dependencies={['current_password']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const current = getFieldValue('current_password');
                if (current && !value) {
                  return Promise.reject(new Error('请输入新密码'));
                }
                if (value && value.length < 6) {
                  return Promise.reject(new Error('密码至少 6 位'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password placeholder="不修改请留空" />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="确认新密码"
          dependencies={['password']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const pwd = getFieldValue('password');
                if (pwd && !value) {
                  return Promise.reject(new Error('请确认新密码'));
                }
                if (value && value !== pwd) {
                  return Promise.reject(new Error('两次密码不一致'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password placeholder="不修改请留空" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
