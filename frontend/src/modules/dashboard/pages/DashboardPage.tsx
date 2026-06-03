import { Card, Col, Row, Tag, Empty, Timeline } from 'antd';
import {
  NotificationOutlined,
  PushpinOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAppSelector } from '@/hooks';
import FadeIn from '@/components/common/FadeIn';
import { useGetAnnouncementsQuery } from '@/services/adminApi';
import WelcomeSection from '../components/WelcomeSection';
import type { Announcement } from '@/modules/announcement/types';
import AnnouncementDetailModal from '@/modules/announcement/components/AnnouncementDetailModal';
import changelogData from '../data/changelogData';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: announcementsData } = useGetAnnouncementsQuery(
    {
      status: true,
      per_page: 10,
    },
    { refetchOnMountOrArgChange: true },
  );

  const announcements = announcementsData?.data ?? [];
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAnnouncement, setDetailAnnouncement] = useState<Announcement | null>(null);

  const handleOpenDetail = (item: Announcement) => {
    setDetailAnnouncement(item);
    setDetailOpen(true);
  };

  return (
    <FadeIn stagger>
      <div className={styles.dashboard}>
        <WelcomeSection userName={user?.name || '用户'} />

        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          <Col xs={24} lg={12}>
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
                <Empty description="暂无公告" style={{ padding: '24px 0' }} />
              ) : (
                <div className={styles.announcementList}>
                  {announcements.map((item: Announcement) => (
                    <div
                      key={item.id}
                      className={styles.announcementItem}
                      onClick={() => handleOpenDetail(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleOpenDetail(item);
                        }
                      }}
                    >
                      <div className={styles.announcementContent}>
                        {item.pinned && <PushpinOutlined className={styles.pinIcon} />}
                        <span className={styles.announcementTitle}>{item.title}</span>
                      </div>
                      <span className={styles.announcementDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <HistoryOutlined style={{ marginRight: 8 }} />
                  更新日志
                </span>
              }
              className={styles.card}
            >
              <div className={styles.changelogTimeline}>
                <Timeline
                  items={changelogData.map((item) => ({
                    color: 'blue',
                    children: (
                      <div className={styles.changelogItem}>
                        <div className={styles.changelogHeader}>
                          <Tag color="blue" className={styles.versionTag}>{item.version}</Tag>
                          <span className={styles.changelogDate}>{item.date}</span>
                        </div>
                        <ul className={styles.changelogChanges}>
                          {item.changes.map((change, index) => (
                            <li key={index}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    ),
                  }))}
                />
              </div>
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
