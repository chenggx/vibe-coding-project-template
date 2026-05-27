import type { User, LoginDto, LoginResponse } from '@/types/auth';
import type { MenuTree } from '@/types/menu';

export type { User, LoginDto, LoginResponse };

export interface CurrentUserResponse {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  status: boolean;
  expires_at: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  roles: Array<{
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }>;
  menus: MenuTree[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[];
  userMenus: MenuTree[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UpdateProfileDto {
  name: string;
  avatar?: string | null;
  password?: string;
  current_password?: string;
}

// 确保模块有运行时导出
export const AUTH_TOKEN_KEY = 'token';
