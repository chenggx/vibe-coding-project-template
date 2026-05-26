import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { roleApi } from './api';
import type { RoleState, FetchRolesParams, CreateRoleDto, UpdateRoleDto, Role } from './types';

const initialState: RoleState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  currentRole: null,
};

export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (params: FetchRolesParams | undefined, { rejectWithValue }) => {
    try {
      const result = await roleApi.getRoles(params) as unknown as { data: Role[]; meta: RoleState['meta'] };
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取角色列表失败';
      return rejectWithValue(message);
    }
  }
);

export const fetchRoleDetail = createAsyncThunk(
  'role/fetchRoleDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const result = await roleApi.getRole(id) as unknown as Role;
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取角色详情失败';
      return rejectWithValue(message);
    }
  }
);

export const createRole = createAsyncThunk(
  'role/createRole',
  async (data: CreateRoleDto, { dispatch, rejectWithValue }) => {
    try {
      const result = await roleApi.createRole(data) as unknown as Role;
      dispatch(fetchRoles());
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建失败';
      return rejectWithValue(message);
    }
  }
);

export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, data }: { id: number; data: UpdateRoleDto }, { dispatch, rejectWithValue }) => {
    try {
      const result = await roleApi.updateRole(id, data) as unknown as Role;
      dispatch(fetchRoles());
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新失败';
      return rejectWithValue(message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await roleApi.deleteRole(id);
      dispatch(fetchRoles());
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除失败';
      return rejectWithValue(message);
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    setCurrentRole: (state, action: PayloadAction<Role | null>) => {
      state.currentRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearRoleError, setCurrentRole } = roleSlice.actions;
export default roleSlice.reducer;
