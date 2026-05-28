import { useEffect } from 'react';
import { Card, Col, Row } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import CountUp from '@/components/common/CountUp';
import { fetchUsers } from '@/modules/user/slice';
import { fetchRoles } from '@/modules/role/slice';
import { useGetAllMenusQuery } from '@/services/adminApi';
import StatsCard from '../components/StatsCard';
import WelcomeSection from '../components/WelcomeSection';
import ActivityTimeline from '../components/ActivityTimeline';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { list: users, meta: usersMeta } = useAppSelector(
    (state) => state.user,
  );
  const { list: roles, meta: rolesMeta } = useAppSelector(
    (state) => state.role,
  );
  const { data: allMenus = [] } = useGetAllMenusQuery();

  useEffect(() => {
    if (users.length === 0 && !usersMeta) {
      dispatch(fetchUsers({ page: 1, per_page: 1 }));
    }
    if (roles.length === 0 && !rolesMeta) {
      dispatch(fetchRoles({ page: 1, per_page: 1 }));
    }
  }, [dispatch, users.length, roles.length, usersMeta, rolesMeta]);

  const userCount = usersMeta?.total ?? users.length;
  const roleCount = rolesMeta?.total ?? roles.length;
  const menuCount = allMenus.length;

  const quickActions = [
    {
      title: '用户管理',
      icon: <UserOutlined />,
      onClick: () => navigate('/users'),
      color: '#0d9488',
    },
    {
      title: '角色管理',
      icon: <TeamOutlined />,
      onClick: () => navigate('/roles'),
      color: '#0d9488',
    },
    {
      title: '菜单管理',
      icon: <MenuOutlined />,
      onClick: () => navigate('/menus'),
      color: '#0d9488',
    },
    {
      title: '个人资料',
      icon: <SettingOutlined />,
      onClick: () => navigate('/profile'),
      color: '#0d9488',
    },
  ];

  return (
    <FadeIn stagger>
      <div className={styles.dashboard}>
        <WelcomeSection userName={user?.name || '用户'} />

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <StatsCard
              title="总用户数"
              value={<CountUp value={typeof userCount === 'number' ? userCount : 0} />}
              icon={<UserOutlined />}
              color="#0d9488"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatsCard
              title="总角色数"
              value={<CountUp value={typeof roleCount === 'number' ? roleCount : 0} />}
              icon={<SafetyOutlined />}
              color="#0d9488"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatsCard
              title="总菜单数"
              value={<CountUp value={menuCount} />}
              icon={<MenuOutlined />}
              color="#0d9488"
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          <Col xs={24} lg={12}>
            <Card title="快捷入口" className={styles.card}>
              <Row gutter={[16, 16]}>
                {quickActions.map((action) => (
                  <Col span={12} key={action.title}>
                    <div
                      className={styles.quickCard}
                      onClick={action.onClick}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          action.onClick();
                        }
                      }}
                    >
                      <div
                        className={styles.quickIcon}
                        style={{ color: action.color }}
                      >
                        {action.icon}
                      </div>
                      <div className={styles.quickTitle}>{action.title}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="最近活动" className={styles.card}>
              <ActivityTimeline />
            </Card>
          </Col>
        </Row>
      </div>
    </FadeIn>
  );
}
