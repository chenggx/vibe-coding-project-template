import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './api';
import { setToken as setTokenStorage, clearToken, getToken } from '@/utils/token';
import { extractPermissions } from '@/utils/menu';
import type {
  AuthState,
  LoginDto,
  LoginResponse,
  CurrentUserResponse,
  UpdateProfileDto,
} from './types';
import type { ApiError } from '@/services/api';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as ApiError).message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return '请求失败';
}

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
      setTokenStorage(response.token);
      await dispatch(fetchCurrentUser()).unwrap();
      return response;
    } catch (err: unknown) {
      return rejectWithValue(err);
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
      return rejectWithValue(err);
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

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileDto, { rejectWithValue }) => {
    try {
      const response =
        (await authApi.updateProfile(data)) as unknown as CurrentUserResponse;
      return response;
    } catch (err: unknown) {
      return rejectWithValue(err);
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
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    setUserAndPermissions: (state, action: PayloadAction<CurrentUserResponse>) => {
      const { menus, ...user } = action.payload;
      state.user = user as typeof state.user;
      state.userMenus = menus;
      state.permissions = extractPermissions(menus);
      state.loading = false;
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
        state.error = extractErrorMessage(action.payload);
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
        state.user = null;
        state.permissions = [];
        state.userMenus = [];
        state.error = extractErrorMessage(action.payload);
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<CurrentUserResponse>) => {
          state.loading = false;
          if (state.user) {
            state.user = {
              ...state.user,
              name: action.payload.name ?? state.user.name,
              email: action.payload.email ?? state.user.email,
              avatar: action.payload.avatar ?? state.user.avatar,
              roles: action.payload.roles ?? state.user.roles,
            };
          }
        },
      )
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload);
      });
  },
});

export const { resetAuth, clearError, setToken, setUserAndPermissions } = authSlice.actions;
export default authSlice.reducer;
