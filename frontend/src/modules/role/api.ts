import api from '@/services/api';
import type { Role, CreateRoleDto, UpdateRoleDto, FetchRolesParams } from './types';
import type { PaginatedResponse } from '@/types/api';

export const roleApi = {
  getRoles: (params?: FetchRolesParams) =>
    api.get<PaginatedResponse<Role>>('/roles', { params }),

  getRole: (id: number) =>
    api.get<Role>(`/roles/${id}`),

  createRole: (data: CreateRoleDto) =>
    api.post<Role>('/roles', data),

  updateRole: (id: number, data: UpdateRoleDto) =>
    api.put<Role>(`/roles/${id}`, data),

  deleteRole: (id: number) =>
    api.delete<null>(`/roles/${id}`),
};
