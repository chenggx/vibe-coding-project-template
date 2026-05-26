import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { userApi } from './api';
import type { UserState, FetchUsersParams, CreateUserDto, UpdateUserDto, User } from './types';

const initialState: UserState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  currentUser: null,
};

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: FetchUsersParams | undefined, { rejectWithValue }) => {
    try {
      const result = await userApi.getUsers(params) as unknown as { data: User[]; meta: UserState['meta'] };
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取用户列表失败';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (data: CreateUserDto, { dispatch, rejectWithValue }) => {
    try {
      const result = await userApi.createUser(data) as unknown as User;
      dispatch(fetchUsers());
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建失败';
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }: { id: number; data: UpdateUserDto }, { dispatch, rejectWithValue }) => {
    try {
      const result = await userApi.updateUser(id, data) as unknown as User;
      dispatch(fetchUsers());
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新失败';
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      dispatch(fetchUsers());
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除失败';
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
