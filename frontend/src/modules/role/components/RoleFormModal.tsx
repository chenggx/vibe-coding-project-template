import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useAppDispatch } from '@/hooks';
import { createRole, updateRole } from '../slice';
import MenuPermissionTree from './MenuPermissionTree';
import type { Role, CreateRoleDto } from '../types';
import type { MenuTree } from '@/types/menu';

interface RoleFormModalProps {
  open: boolean;
  role: Role | null;
  allMenus: MenuTree[];
  onCancel: () => void;
  onSuccess: () => void;
}

export default function RoleFormModal({ open, role, allMenus, onCancel, onSuccess }: RoleFormModalProps) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      if (role) {
        const menuIds = role.menus?.map((m) => m.id) || [];
        form.setFieldsValue({
          name: role.name,
          display_name: role.display_name,
          description: role.description,
          menu_ids: menuIds,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, role, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateRoleDto = {
        name: values.name,
        display_name: values.display_name,
        description: values.description || undefined,
        menu_ids: values.menu_ids || [],
      };

      if (role) {
        await dispatch(updateRole({ id: role.id, data: dto })).unwrap();
        message.success('更新成功');
      } else {
        await dispatch(createRole(dto)).unwrap();
        message.success('创建成功');
      }
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return;
      }
      const errorMsg = typeof err === 'string' ? err : err instanceof Error ? err.message : '操作失败';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      title={role ? '编辑角色' : '新增角色'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="角色标识" rules={[{ required: true, message: '请输入角色标识' }]}>
          <Input placeholder="如 editor" />
        </Form.Item>
        <Form.Item name="display_name" label="显示名称" rules={[{ required: true, message: '请输入显示名称' }]}>
          <Input placeholder="如 编辑" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="角色描述" />
        </Form.Item>
        <Form.Item name="menu_ids" label="菜单权限">
          <MenuPermissionTree menuData={allMenus} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
