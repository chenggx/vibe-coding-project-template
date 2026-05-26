import { useEffect, useState } from 'react';
import { Card, Button, message, Modal } from 'antd';
import {
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { fetchAllMenus, deleteMenu } from '../slice';
import MenuTreeTable from '../components/MenuTreeTable';
import MenuFormModal from '../components/MenuFormModal';
import type { MenuTree } from '@/types/menu';

export default function MenuListPage() {
  const dispatch = useAppDispatch();
  const { allMenus, loading } = useAppSelector((state) => state.menu);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuTree | null>(null);

  useEffect(() => {
    dispatch(fetchAllMenus());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingMenu(null);
    setModalOpen(true);
  };

  const handleEdit = (menu: MenuTree) => {
    setEditingMenu(menu);
    setModalOpen(true);
  };

  const handleDelete = (menu: MenuTree) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除菜单「${menu.name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteMenu(menu.id)).unwrap();
          message.success('删除成功');
        } catch (err: unknown) {
          const errorMsg =
            err instanceof Error ? err.message : '删除失败';
          message.error(errorMsg);
        }
      },
    });
  };

  return (
    <div>
      <Card
        title="菜单管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增菜单
          </Button>
        }
      >
        <MenuTreeTable
          data={allMenus}
          loading={loading}
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
    </div>
  );
}
