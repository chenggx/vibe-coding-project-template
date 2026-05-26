import { Tag, Space } from 'antd';
import type { Role } from '@/types/auth';

interface RoleTagProps {
  roles: Role[];
}

const colors = ['blue', 'green', 'orange', 'purple', 'cyan'];

export default function RoleTag({ roles }: RoleTagProps) {
  if (!roles?.length) return <span>-</span>;
  return (
    <Space size={[0, 4]} wrap>
      {roles.map((role, index) => (
        <Tag key={role.id} color={colors[index % colors.length]}>
          {role.display_name}
        </Tag>
      ))}
    </Space>
  );
}
