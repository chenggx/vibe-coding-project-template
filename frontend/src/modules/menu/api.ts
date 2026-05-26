import api from '@/services/api';
import type { MenuTree } from '@/types/menu';
import type { CreateMenuDto, UpdateMenuDto } from './types';

export const menuApi = {
  getMenus: () => api.get<MenuTree[]>('/menus'),

  getAllMenus: () => api.get<MenuTree[]>('/menus/all'),

  getMenu: (id: number) => api.get<MenuTree>(`/menus/${id}`),

  createMenu: (data: CreateMenuDto) => api.post<MenuTree>('/menus', data),

  updateMenu: (id: number, data: UpdateMenuDto) =>
    api.put<MenuTree>(`/menus/${id}`, data),

  deleteMenu: (id: number) => api.delete<null>(`/menus/${id}`),
};
