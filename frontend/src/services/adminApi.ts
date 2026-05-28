import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { resetAuth } from '@/modules/auth/slice';
import type { RootState } from '@/store';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    if (status === 401) {
      api.dispatch(resetAuth());
      window.location.href = '/login';
    }
    return { error: result.error };
  }

  const response = result.data as ApiResponse<unknown> | PaginatedResponse<unknown>;

  if (response === null || typeof response !== 'object') {
    return { data: response };
  }

  const { code, message, data } = response;

  if (code !== 0) {
    if (code === 10002) {
      api.dispatch(resetAuth());
      window.location.href = '/login';
    }
    return {
      error: {
        status: code,
        data: { message, code },
      } as FetchBaseQueryError,
    };
  }

  if ('meta' in response && response.meta !== undefined) {
    return { data: { data, meta: response.meta } };
  }

  return { data };
};

import type { UploadResponse } from '@/modules/upload/types';
import type { MenuTree } from '@/types/menu';
import type { CreateMenuDto, UpdateMenuDto } from '@/modules/menu/types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: customBaseQuery,
  tagTypes: ['User', 'Role', 'Menu', 'Auth', 'Upload'],
  endpoints: (build) => ({
    uploadFile: build.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/upload', method: 'POST', body: formData };
      },
    }),
    getAllMenus: build.query<MenuTree[], void>({
      query: () => '/menus/all',
      providesTags: ['Menu'],
    }),
    createMenu: build.mutation<MenuTree, CreateMenuDto>({
      query: (body) => ({ url: '/menus', method: 'POST', body }),
      invalidatesTags: ['Menu'],
    }),
    updateMenu: build.mutation<MenuTree, { id: number; data: UpdateMenuDto }>({
      query: ({ id, data }) => ({ url: `/menus/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Menu'],
    }),
    deleteMenu: build.mutation<void, number>({
      query: (id) => ({ url: `/menus/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Menu'],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetAllMenusQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} = adminApi;
