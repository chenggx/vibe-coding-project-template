import api from '@/services/api';
import type { User, CreateUserDto, UpdateUserDto, FetchUsersParams } from './types';

export const userApi = {
  getUsers: (params?: FetchUsersParams) =>
    api.get('/users', { params }),

  getUser: (id: number) =>
    api.get<User>(`/users/${id}`),

  createUser: (data: CreateUserDto) =>
    api.post<User>('/users', data),

  updateUser: (id: number, data: UpdateUserDto) =>
    api.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) =>
    api.delete<null>(`/users/${id}`),
};
