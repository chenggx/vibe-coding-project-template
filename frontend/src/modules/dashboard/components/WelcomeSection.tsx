import { Typography } from 'antd';
import dayjs from 'dayjs';
import styles from './WelcomeSection.module.css';

const { Title, Text } = Typography;

interface WelcomeSectionProps {
  userName: string;
}

export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  const now = dayjs();
  const hour = now.hour();

  let greeting = '早上好';
  if (hour >= 12 && hour < 18) greeting = '下午好';
  else if (hour >= 18) greeting = '晚上好';

  return (
    <div className={styles.welcome}>
      <Title level={3} className={styles.title}>
        {greeting}，{userName}
      </Title>
      <Text className={styles.subtitle}>
        今天是 {now.format('YYYY年MM月DD日 dddd')}，欢迎回到管理后台。
      </Text>
    </div>
  );
}
