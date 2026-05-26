import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { menuApi } from './api';
import type { MenuState, CreateMenuDto, UpdateMenuDto } from './types';
import type { MenuTree } from '@/types/menu';

const initialState: MenuState = {
  allMenus: [],
  loading: false,
  error: null,
};

export const fetchAllMenus = createAsyncThunk(
  'menu/fetchAllMenus',
  async (_, { rejectWithValue }) => {
    try {
      return (await menuApi.getAllMenus()) as unknown as MenuTree[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取菜单失败';
      return rejectWithValue(message);
    }
  },
);

export const createMenu = createAsyncThunk(
  'menu/createMenu',
  async (
    data: CreateMenuDto,
    { dispatch, rejectWithValue },
  ) => {
    try {
      const result = (await menuApi.createMenu(data)) as unknown as MenuTree;
      dispatch(fetchAllMenus());
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建失败';
      return rejectWithValue(message);
    }
  },
);

export const updateMenu = createAsyncThunk(
  'menu/updateMenu',
  async (
    { id, data }: { id: number; data: UpdateMenuDto },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const result = (await menuApi.updateMenu(
        id,
        data,
      )) as unknown as MenuTree;
      dispatch(fetchAllMenus());
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新失败';
      return rejectWithValue(message);
    }
  },
);

export const deleteMenu = createAsyncThunk(
  'menu/deleteMenu',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await menuApi.deleteMenu(id);
      dispatch(fetchAllMenus());
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除失败';
      return rejectWithValue(message);
    }
  },
);

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllMenus.fulfilled,
        (state, action: PayloadAction<MenuTree[]>) => {
          state.loading = false;
          state.allMenus = action.payload;
        },
      )
      .addCase(fetchAllMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateMenu.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearMenuError } = menuSlice.actions;
export default menuSlice.reducer;
