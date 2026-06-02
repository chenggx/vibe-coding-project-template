import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/hooks';
import { useLoginMutation } from '@/services/adminApi';
import { getApiErrorMessage } from '@/utils/error';
import styles from './LoginPage.module.css';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onFinish = useCallback(
    async (values: LoginFormValues) => {
      setErrorMsg(null);
      try {
        await login(values).unwrap();
        navigate(from, { replace: true });
      } catch (err: unknown) {
        setErrorMsg(getApiErrorMessage(err, '登录失败'));
      }
    },
    [login, navigate, from],
  );

  const inputStyle = {
    height: 48,
    borderRadius: 10,
    background: 'var(--color-bg-page)',
  };

  const buttonStyle = {
    height: 48,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
  };

  return (
    <div className={styles.container}>
      {/* Brand Section */}
      <motion.div
        className={styles.brandSection}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>Admin</div>
          <h2 className={styles.brandTitle}>简洁高效的后台管理系统</h2>
          <p className={styles.brandSubtitle}>
            为团队提供安全、稳定、易用的管理体验
          </p>
        </div>
      </motion.div>

      {/* Form Section */}
      <div className={styles.formSection}>
        <motion.div
          className={styles.loginCard}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.header} variants={itemVariants}>
            <Title level={3} style={{ marginBottom: 8, fontSize: 24, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
              欢迎回来
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              请登录您的账户以继续
            </Text>
          </motion.div>

          {errorMsg && (
            <motion.div variants={itemVariants}>
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                style={{ marginBottom: 24, borderRadius: 10 }}
              />
            </motion.div>
          )}

          <Form name="login" onFinish={onFinish} autoComplete="off">
            <motion.div variants={itemVariants}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: 'var(--color-text-secondary)', marginRight: 8 }} />}
                  placeholder="邮箱"
                  style={inputStyle}
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: 'var(--color-text-secondary)', marginRight: 8 }} />}
                  placeholder="密码"
                  style={inputStyle}
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  style={buttonStyle}
                >
                  登录
                </Button>
              </Form.Item>
            </motion.div>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
