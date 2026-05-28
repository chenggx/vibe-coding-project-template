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

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: customBaseQuery,
  tagTypes: ['User', 'Role', 'Menu', 'Auth', 'Upload'],
  endpoints: () => ({}),
});
