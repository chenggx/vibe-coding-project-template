import { useState } from 'react';
import { Card, App } from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import PermissionButton from '@/components/common/PermissionButton';
import FadeIn from '@/components/common/FadeIn';
import {
  useGetAllMenusQuery,
  useDeleteMenuMutation,
} from '@/services/adminApi';
import { getApiErrorMessage } from '@/utils/error';
import MenuTreeTable from '../components/MenuTreeTable';
import MenuFormModal from '../components/MenuFormModal';
import type { MenuTree } from '@/types/menu';

export default function MenuListPage() {
  const { message, modal } = App.useApp();
  const { data: allMenus = [], isLoading } = useGetAllMenusQuery();
  const [deleteMenu] = useDeleteMenuMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuTree | null>(null);

  const handleAdd = () => {
    setEditingMenu(null);
    setModalOpen(true);
  };

  const handleEdit = (menu: MenuTree) => {
    setEditingMenu(menu);
    setModalOpen(true);
  };

  const handleDelete = (menu: MenuTree) => {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除菜单「${menu.name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteMenu(menu.id).unwrap();
          message.success('删除成功');
        } catch (err: unknown) {
          message.error(getApiErrorMessage(err, '删除失败'));
        }
      },
    });
  };

  return (
    <FadeIn stagger>
      <Card
        title="菜单管理"
        style={{ background: 'var(--color-bg-card)' }}
        extra={
          <PermissionButton
            type="primary"
            icon={<PlusOutlined />}
            permission="menus.store"
            onClick={handleAdd}
          >
            新增菜单
          </PermissionButton>
        }
      >
        <MenuTreeTable
          data={allMenus}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={handleAdd}
        />
      </Card>
      <MenuFormModal
        open={modalOpen}
        menu={editingMenu}
        allMenus={allMenus}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </FadeIn>
  );
}
