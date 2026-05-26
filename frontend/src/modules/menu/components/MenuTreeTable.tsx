import { Table, Tag, Button, Space, Typography } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuTree } from '@/types/menu';
import PermissionWrapper from '@/components/common/PermissionWrapper';

const { Text } = Typography;

const typeColors: Record<string, string> = {
  catalog: 'blue',
  menu: 'green',
  permission: 'orange',
};

interface MenuTreeTableProps {
  data: MenuTree[];
  loading: boolean;
  onEdit: (menu: MenuTree) => void;
  onDelete: (menu: MenuTree) => void;
  onAddChild: (parentId: number) => void;
}

export default function MenuTreeTable({
  data,
  loading,
  onEdit,
  onDelete,
  onAddChild,
}: MenuTreeTableProps) {
  const columns: ColumnsType<MenuTree> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={typeColors[type] || 'default'}>{type}</Tag>
      ),
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      render: (path: string | null) => path || '-',
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      key: 'permission',
      render: (permission: string | null) => permission || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space>
          {record.type !== 'permission' && (
            <PermissionWrapper permission="menus.create">
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => onAddChild(record.id)}
              >
                子节点
              </Button>
            </PermissionWrapper>
          )}
          <PermissionWrapper permission="menus.update">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
          </PermissionWrapper>
          <PermissionWrapper permission="menus.delete">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            >
              删除
            </Button>
          </PermissionWrapper>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={false}
      childrenColumnName="children"
      defaultExpandAllRows
    />
  );
}
