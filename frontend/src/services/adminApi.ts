import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { resetAuth, setToken, setUserAndPermissions } from '@/modules/auth/slice';
import { setToken as setTokenStorage, clearToken } from '@/utils/token';
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
import type { User, CreateUserDto, UpdateUserDto, FetchUsersParams } from '@/modules/user/types';
import type { Role, CreateRoleDto, UpdateRoleDto, FetchRolesParams } from '@/modules/role/types';
import type { PaginationMeta } from '@/types/api';
import type { LoginDto, LoginResponse, CurrentUserResponse, UpdateProfileDto } from '@/modules/auth/types';

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
    getUsers: build.query<{ data: User[]; meta: PaginationMeta }, FetchUsersParams | void>({
      query: (params) => ({ url: '/users', params }),
      providesTags: (result) =>
        result ? [...result.data.map((u) => ({ type: 'User' as const, id: u.id })), 'User'] : ['User'],
    }),
    createUser: build.mutation<User, CreateUserDto>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: build.mutation<User, { id: number; data: UpdateUserDto }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    getRoles: build.query<{ data: Role[]; meta: PaginationMeta }, FetchRolesParams | void>({
      query: (params) => ({ url: '/roles', params }),
      providesTags: (result) =>
        result ? [...result.data.map((r) => ({ type: 'Role' as const, id: r.id })), 'Role'] : ['Role'],
    }),
    getRole: build.query<Role, number>({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Role', id }],
    }),
    createRole: build.mutation<Role, CreateRoleDto>({
      query: (body) => ({ url: '/roles', method: 'POST', body }),
      invalidatesTags: ['Role'],
    }),
    updateRole: build.mutation<Role, { id: number; data: UpdateRoleDto }>({
      query: ({ id, data }) => ({ url: `/roles/${id}`, method: 'PUT', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Role', id }, 'Role'],
    }),
    deleteRole: build.mutation<void, number>({
      query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Role'],
    }),
    login: build.mutation<LoginResponse, LoginDto>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          setTokenStorage(data.token);
          dispatch(setToken(data.token));
        } catch {
          // silently ignore
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try { await queryFulfilled; } catch {
          // silently ignore
        }
        clearToken();
        dispatch(resetAuth());
      },
    }),
    getCurrentUser: build.query<CurrentUserResponse, void>({
      query: () => '/user',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserAndPermissions(data));
        } catch {
          clearToken();
          dispatch(resetAuth());
        }
      },
    }),
    updateProfile: build.mutation<CurrentUserResponse, UpdateProfileDto>({
      query: (body) => ({ url: '/profile', method: 'PUT', body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUserAndPermissions(data));
        } catch {
          // silently ignore
        }
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetAllMenusQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = adminApi;
