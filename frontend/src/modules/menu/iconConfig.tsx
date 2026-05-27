import {
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CloudOutlined,
  CodeOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOutlined,
  HomeOutlined,
  KeyOutlined,
  LinkOutlined,
  LockOutlined,
  MailOutlined,
  MenuOutlined,
  MessageOutlined,
  PieChartOutlined,
  PlusOutlined,
  SafetyOutlined,
  SearchOutlined,
  SettingOutlined,
  StarOutlined,
  TagOutlined,
  TeamOutlined,
  ToolOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type React from 'react';

interface IconOption {
  name: string;
  component: React.ComponentType;
}

export const AVAILABLE_ICONS: IconOption[] = [
  { name: 'Dashboard', component: HomeOutlined },
  { name: 'Setting', component: SettingOutlined },
  { name: 'User', component: UserOutlined },
  { name: 'Team', component: TeamOutlined },
  { name: 'Menu', component: MenuOutlined },
  { name: 'Shield', component: SafetyOutlined },
  { name: 'FileText', component: FileTextOutlined },
  { name: 'Lock', component: LockOutlined },
  { name: 'Eye', component: EyeOutlined },
  { name: 'Edit', component: EditOutlined },
  { name: 'Delete', component: DeleteOutlined },
  { name: 'Plus', component: PlusOutlined },
  { name: 'Search', component: SearchOutlined },
  { name: 'Bell', component: BellOutlined },
  { name: 'Mail', component: MailOutlined },
  { name: 'Calendar', component: CalendarOutlined },
  { name: 'BarChart', component: BarChartOutlined },
  { name: 'PieChart', component: PieChartOutlined },
  { name: 'Cloud', component: CloudOutlined },
  { name: 'Database', component: DatabaseOutlined },
  { name: 'Code', component: CodeOutlined },
  { name: 'Tag', component: TagOutlined },
  { name: 'Folder', component: FolderOutlined },
  { name: 'Link', component: LinkOutlined },
  { name: 'Star', component: StarOutlined },
  { name: 'Key', component: KeyOutlined },
  { name: 'Tool', component: ToolOutlined },
  { name: 'Upload', component: UploadOutlined },
  { name: 'Download', component: DownloadOutlined },
  { name: 'Message', component: MessageOutlined },
];

export const iconMap: Record<string, React.ReactNode> = AVAILABLE_ICONS.reduce(
  (map, { name, component: Component }) => {
    map[name] = <Component />;
    return map;
  },
  {} as Record<string, React.ReactNode>,
);
