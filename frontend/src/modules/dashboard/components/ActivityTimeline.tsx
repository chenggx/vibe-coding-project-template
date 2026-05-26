import { Timeline, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const activities = [
  {
    time: dayjs().subtract(2, 'hour').format('HH:mm'),
    content: '系统启动完成',
  },
  {
    time: dayjs().subtract(1, 'hour').format('HH:mm'),
    content: '管理员登录系统',
  },
  {
    time: dayjs().subtract(30, 'minute').format('HH:mm'),
    content: '权限配置已更新',
  },
];

export default function ActivityTimeline() {
  return (
    <Timeline
      items={activities.map((activity) => ({
        content: (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {activity.time}
            </Text>
            <div>{activity.content}</div>
          </div>
        ),
      }))}
    />
  );
}
