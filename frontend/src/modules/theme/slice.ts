import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type ThemeMode, THEME_STORAGE_KEY } from './types';

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getResolvedMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

interface ThemeSliceState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
}

const initialState: ThemeSliceState = {
  mode: getInitialMode(),
  resolvedMode: getResolvedMode(getInitialMode()),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      state.resolvedMode = getResolvedMode(action.payload);
      localStorage.setItem(THEME_STORAGE_KEY, action.payload);
    },
    syncSystemTheme(state) {
      if (state.mode === 'system') {
        state.resolvedMode = getResolvedMode('system');
      }
    },
  },
});

export const { setThemeMode, syncSystemTheme } = themeSlice.actions;
export default themeSlice.reducer;
