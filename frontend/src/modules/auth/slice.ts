import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getToken } from '@/utils/token';
import { extractPermissions } from '@/utils/menu';
import type { AuthState, CurrentUserResponse, User } from './types';

const initialState: AuthState = {
  token: getToken(),
  user: null,
  permissions: [],
  userMenus: [],
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

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
      state.userMenus = menus ?? [];
      state.permissions = extractPermissions(menus ?? []);
      state.loading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { resetAuth, clearError, setToken, setUserAndPermissions, updateUser } = authSlice.actions;
export default authSlice.reducer;
