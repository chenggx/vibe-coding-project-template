import api from '@/services/api';
import type { LoginDto, LoginResponse, CurrentUserResponse } from './types';

export const authApi = {
  login: (data: LoginDto) =>
    api.post<LoginResponse>('/login', data),

  logout: () =>
    api.post<null>('/logout'),

  getCurrentUser: () =>
    api.get<CurrentUserResponse>('/user'),
};
