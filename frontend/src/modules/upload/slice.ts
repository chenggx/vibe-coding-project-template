import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadApi } from './api';
import type { UploadState } from './types';

const initialState: UploadState = {
  loading: false,
  error: null,
};

export const uploadFile = createAsyncThunk(
  'upload/uploadFile',
  async (file: File, { rejectWithValue }) => {
    try {
      const result = (await uploadApi.uploadFile(file)) as unknown as {
        url: string;
      };
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '上传失败';
      return rejectWithValue(message);
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearUploadError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUploadError } = uploadSlice.actions;
export default uploadSlice.reducer;
