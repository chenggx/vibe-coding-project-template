import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './api';
import { setToken, clearToken, getToken } from '@/utils/token';
import { extractPermissions } from '@/utils/menu';
import type {
  AuthState,
  LoginDto,
  LoginResponse,
  CurrentUserResponse,
} from './types';

const initialState: AuthState = {
  token: getToken(),
  user: null,
  permissions: [],
  userMenus: [],
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { dispatch, rejectWithValue }) => {
    try {
      const response = (await authApi.login(
        credentials,
      )) as unknown as LoginResponse;
      setToken(response.token);
      dispatch(fetchCurrentUser());
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败';
      return rejectWithValue(message);
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response =
        (await authApi.getCurrentUser()) as unknown as CurrentUserResponse;
      return response;
    } catch (err: unknown) {
      clearToken();
      const message =
        err instanceof Error ? err.message : '获取用户信息失败';
      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } catch {
      // 无论成功失败都清除本地状态
    } finally {
      clearToken();
      dispatch(resetAuth());
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: (state) => {
      state.token = null;
      state.user = null;
      state.permissions = [];
      state.userMenus = [];
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<CurrentUserResponse>) => {
          state.loading = false;
          state.user = {
            id: action.payload.id,
            name: action.payload.name,
            email: action.payload.email,
            avatar: action.payload.avatar,
            status: action.payload.status,
            expires_at: action.payload.expires_at,
            remarks: action.payload.remarks,
            is_super_admin: action.payload.is_super_admin,
            created_at: action.payload.created_at,
            updated_at: action.payload.updated_at,
            roles: action.payload.roles,
          };
          state.userMenus = action.payload.menus;
          state.permissions = extractPermissions(action.payload.menus);
          state.isAuthenticated = true;
        },
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload as string;
      });
  },
});

export const { resetAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
