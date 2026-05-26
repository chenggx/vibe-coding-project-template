import { Card, Col, Row } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SafetyOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import StatsCard from '../components/StatsCard';
import QuickActionGrid from '../components/QuickActionGrid';
import WelcomeSection from '../components/WelcomeSection';
import ActivityTimeline from '../components/ActivityTimeline';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const quickActions = [
    {
      title: '新增用户',
      icon: <PlusOutlined />,
      onClick: () => navigate('/users'),
      color: '#c45c3e',
    },
    {
      title: '角色管理',
      icon: <TeamOutlined />,
      onClick: () => navigate('/roles'),
      color: '#666666',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <WelcomeSection userName={user?.name || '用户'} />

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="用户总数"
            value="--"
            icon={<UserOutlined />}
            color="#c45c3e"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="角色数量"
            value="--"
            icon={<TeamOutlined />}
            color="#666666"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="菜单节点"
            value="--"
            icon={<MenuOutlined />}
            color="#8B7355"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="系统状态"
            value="正常"
            icon={<SafetyOutlined />}
            color="#4A7C59"
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="快捷操作" className={styles.card}>
            <QuickActionGrid actions={quickActions} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近活动" className={styles.card}>
            <ActivityTimeline />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
