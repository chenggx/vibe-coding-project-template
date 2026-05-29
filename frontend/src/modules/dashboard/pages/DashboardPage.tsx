import { Card, Col, Row } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SafetyOutlined,
  SettingOutlined,
  NotificationOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import CountUp from '@/components/common/CountUp';
import {
  useGetUsersQuery,
  useGetRolesQuery,
  useGetAllMenusQuery,
  useGetAnnouncementsQuery,
} from '@/services/adminApi';
import StatsCard from '../components/StatsCard';
import WelcomeSection from '../components/WelcomeSection';
import ActivityTimeline from '../components/ActivityTimeline';
import type { Announcement } from '@/modules/announcement/types';
import AnnouncementDetailModal from '@/modules/announcement/components/AnnouncementDetailModal';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { data: usersData } = useGetUsersQuery({ page: 1, per_page: 1 });
  const { data: rolesData } = useGetRolesQuery({ page: 1, per_page: 1 });
  const { data: allMenus = [] } = useGetAllMenusQuery();
  const { data: announcementsData } = useGetAnnouncementsQuery(
    {
      status: true,
      per_page: 5,
    },
    { refetchOnMountOrArgChange: true },
  );

  const userCount = usersData?.meta?.total ?? 0;
  const roleCount = rolesData?.meta?.total ?? 0;
  const menuCount = allMenus.length;
  const announcements = announcementsData?.data ?? [];
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);

  const handleOpenDetail = (item: Announcement) => {
    setDetailAnnouncement(item);
    setDetailOpen(true);
  };

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

        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          <Col xs={24}>
            <Card
              title={
                <span>
                  <NotificationOutlined style={{ marginRight: 8 }} />
                  系统公告
                </span>
              }
              className={styles.card}
            >
              {announcements.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>
                  暂无公告
                </div>
              ) : (
                <div>
                  {announcements.map((item: Announcement) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleOpenDetail(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleOpenDetail(item);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {item.pinned && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
                        <span style={{ fontWeight: 500, flex: 1 }}>{item.title}</span>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
      <AnnouncementDetailModal
        open={detailOpen}
        announcement={detailAnnouncement}
        onClose={() => setDetailOpen(false)}
      />
    </FadeIn>
  );
}
