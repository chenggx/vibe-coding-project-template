import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Radio, TreeSelect, message } from 'antd';
import { useAppDispatch } from '@/hooks';
import { createMenu, updateMenu } from '../slice';
import type { MenuTree } from '@/types/menu';
import type { CreateMenuDto } from '../types';
import IconSelector from './IconSelector';

interface MenuFormModalProps {
  open: boolean;
  menu: MenuTree | null;
  allMenus: MenuTree[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface TreeNode {
  title: string;
  value: number;
  children?: TreeNode[];
}

function menusToTreeData(
  menus: MenuTree[],
  excludeId?: number,
): TreeNode[] {
  return menus
    .filter((m) => m.id !== excludeId && m.type !== 'permission')
    .map((m) => ({
      title: m.name,
      value: m.id,
      children: m.children?.length
        ? menusToTreeData(m.children, excludeId)
        : undefined,
    }));
}

export default function MenuFormModal({
  open,
  menu,
  allMenus,
  onCancel,
  onSuccess,
}: MenuFormModalProps) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const menuType = Form.useWatch('type', form);

  useEffect(() => {
    if (open) {
      if (menu) {
        form.setFieldsValue({
          parent_id: menu.parent_id,
          name: menu.name,
          type: menu.type,
          path: menu.path,
          icon: menu.icon,
          permission: menu.permission,
          sort_order: menu.sort_order,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, menu, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateMenuDto = {
        parent_id: values.parent_id || null,
        name: values.name,
        type: values.type,
        path: values.path || null,
        icon: values.icon || null,
        permission: values.permission || null,
        sort_order: values.sort_order,
      };

      if (menu) {
        await dispatch(updateMenu({ id: menu.id, data: dto })).unwrap();
        message.success('更新成功');
      } else {
        await dispatch(createMenu(dto)).unwrap();
        message.success('创建成功');
      }
      onSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        return;
      }
      const errorMsg =
        typeof err === 'string' ? err : err instanceof Error ? err.message : '操作失败';
      message.error(errorMsg);
    }
  };

  return (
    <Modal
      title={menu ? '编辑菜单' : '新增菜单'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: 'menu', sort_order: 0 }}
      >
        <Form.Item name="parent_id" label="上级菜单">
          <TreeSelect
            placeholder="留空为顶级菜单"
            treeData={menusToTreeData(allMenus, menu?.id)}
            allowClear
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="菜单名称"
          rules={[{ required: true, message: '请输入菜单名称' }]}
        >
          <Input placeholder="请输入菜单名称" />
        </Form.Item>

        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value="catalog">目录</Radio.Button>
            <Radio.Button value="menu">菜单</Radio.Button>
            <Radio.Button value="permission">权限点</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {menuType === 'menu' && (
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: '菜单类型必须填写路径' }]}
          >
            <Input placeholder="/example" />
          </Form.Item>
        )}

        {menuType !== 'permission' && (
          <Form.Item name="icon" label="图标">
            <IconSelector />
          </Form.Item>
        )}

        {menuType !== 'catalog' && (
          <Form.Item
            name="permission"
            label="权限标识"
            rules={[{ required: true, message: '请填写权限标识' }]}
          >
            <Input placeholder="如 users.index" />
          </Form.Item>
        )}

        <Form.Item name="sort_order" label="排序">
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
