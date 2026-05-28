import { useState, useCallback } from 'react';
import { App } from 'antd';

export function useCrudTable<T extends { id: number }>() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const { modal, message } = App.useApp();

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (options: { item: T; onConfirm: (id: number) => Promise<void> }) => {
      modal.confirm({
        title: '确认删除',
        content: `确定要删除吗？`,
        onOk: async () => {
          await options.onConfirm(options.item.id);
          message.success('删除成功');
        },
      });
    },
    [modal, message],
  );

  return {
    modalOpen,
    editingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    setModalOpen,
    setEditingItem,
  };
}
