import type { MenuTree } from './menu';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  status: boolean;
  expires_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CurrentUserResponse extends Omit<User, 'roles'> {
  roles: Role[];
  menus: MenuTree[];
}

// 确保模块有运行时导出
export const USER_STATUS_ACTIVE = true;
