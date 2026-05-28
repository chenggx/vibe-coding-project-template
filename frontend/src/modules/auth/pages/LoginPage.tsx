import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import { useLoginMutation } from '@/services/adminApi';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = useCallback(
    async (values: LoginFormValues) => {
      try {
        await login(values).unwrap();
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message || '登录失败';
        messageApi.error(msg);
      }
    },
    [login, navigate, messageApi],
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg-page)',
        backgroundImage:
          'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '16px',
      }}
    >
      {contextHolder}
      <FadeIn>
        <Card
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--color-bg-card)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 12,
          }}
          styles={{ body: { padding: '40px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={3} style={{ marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
              欢迎回来
            </Title>
            <Text type="secondary">请登录您的账户以继续</Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'var(--color-text-secondary)' }} />}
                placeholder="邮箱"
                style={{ height: 44, borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'var(--color-text-secondary)' }} />}
                placeholder="密码"
                style={{ height: 44, borderRadius: 6 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                style={{ height: 44, borderRadius: 6 }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </FadeIn>
    </div>
  );
}
