import { useEffect } from 'react';
import { Card, Form, Input, Button, Upload, App, Row, Col, Typography } from 'antd';
import { CameraOutlined, UserOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import { updateProfile } from '../slice';
import { handleApiError } from '@/services/errorHandler';
import { uploadApi } from '@/modules/upload/api';
import styles from './ProfilePage.module.css';

const { Title } = Typography;

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
      const { confirm_password: _unused, ...payload } = values;
      await dispatch(updateProfile(payload)).unwrap();
      message.success('保存成功');
      form.resetFields(['current_password', 'password', 'confirm_password']);
    } catch (err) {
      handleApiError(err, message);
    }
  };

  const roleName = user?.roles?.[0]?.display_name || user?.roles?.[0]?.name || '-';

  return (
    <FadeIn>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow)',
              borderRadius: 8,
            }}
          >
            <div className={styles.profileHeader}>
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
              <div className={styles.profileInfo}>
                <Title level={4} style={{ marginBottom: 4 }}>
                  {user?.name || '用户'}
                </Title>
                <div className={styles.profileMeta}>
                  <span className={styles.metaItem}>
                    <SafetyOutlined style={{ marginRight: 6 }} />
                    {roleName}
                  </span>
                  <span className={styles.metaItem}>
                    <MailOutlined style={{ marginRight: 6 }} />
                    {user?.email || '-'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title="编辑资料"
            style={{
              background: 'var(--color-bg-card)',
              boxShadow: 'var(--shadow)',
              borderRadius: 8,
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <div className={styles.sectionTitle}>基本信息</div>
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
                </Col>
                <Col xs={24} md={12}>
                  <div className={styles.sectionTitle}>安全设置</div>
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
                </Col>
              </Row>

              <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </FadeIn>
  );
}
