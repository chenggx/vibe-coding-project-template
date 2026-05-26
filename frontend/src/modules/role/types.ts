import type { MenuTree } from '@/types/menu';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  users_count?: number;
  menus?: MenuTree[];
}

export interface CreateRoleDto {
  name: string;
  display_name: string;
  description?: string;
  menu_ids?: number[];
}

export type UpdateRoleDto = Partial<CreateRoleDto>;

export interface FetchRolesParams {
  page?: number;
  per_page?: number;
}

export interface RoleState {
  list: Role[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  loading: boolean;
  error: string | null;
  currentRole: Role | null;
}

// 确保模块有运行时导出
export const ROLE_DEFAULT_PER_PAGE = 15;
