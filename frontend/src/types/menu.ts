export type MenuType = 'catalog' | 'menu' | 'permission';

export interface MenuTree {
  id: number;
  parent_id: number | null;
  name: string;
  type: MenuType;
  path: string | null;
  icon: string | null;
  permission: string | null;
  sort_order: number;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  children: MenuTree[];
}

// 确保模块有运行时导出，避免 Vite 将纯类型模块视为空模块
export const MENU_TYPE_CATALOG = 'catalog' as const;
export const MENU_TYPE_MENU = 'menu' as const;
export const MENU_TYPE_PERMISSION = 'permission' as const;
