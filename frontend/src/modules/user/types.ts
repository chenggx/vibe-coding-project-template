import type { Role } from '@/types/auth';

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

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  status?: boolean;
  expires_at?: string;
  remarks?: string;
  role_ids?: number[];
}

export interface UpdateUserDto {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  status?: boolean;
  expires_at?: string;
  remarks?: string;
  role_ids?: number[];
}

export interface FetchUsersParams {
  name?: string;
  email?: string;
  page?: number;
  per_page?: number;
}

export interface UserState {
  list: User[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
  loading: boolean;
  error: string | null;
  currentUser: User | null;
}

// 确保模块有运行时导出
export const USER_DEFAULT_PER_PAGE = 15;
