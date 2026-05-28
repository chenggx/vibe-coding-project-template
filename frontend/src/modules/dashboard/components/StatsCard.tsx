import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';
import styles from './StatsCard.module.css';

const { Text } = Typography;

interface StatsCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  color: string;
  suffix?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  suffix,
}: StatsCardProps) {
  return (
    <Card className={styles.card} styles={{ body: { padding: '24px' } }}>
      <div className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <div className={styles.icon} style={{ color }}>
          {icon}
        </div>
      </div>
      <div className={styles.value} style={{ color }}>
        {value}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    </Card>
  );
}
