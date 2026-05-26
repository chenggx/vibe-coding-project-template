import type { MenuTree, MenuType } from '@/types/menu';

export type { MenuTree, MenuType };

export interface CreateMenuDto {
  parent_id?: number | null;
  name: string;
  type: MenuType;
  path?: string | null;
  icon?: string | null;
  permission?: string | null;
  sort_order?: number;
  meta?: Record<string, unknown> | null;
}

export type UpdateMenuDto = Partial<CreateMenuDto>;

export interface MenuState {
  allMenus: MenuTree[];
  loading: boolean;
  error: string | null;
}

// 确保模块有运行时导出
export const MENU_DEFAULT_SORT_ORDER = 0;
