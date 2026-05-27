export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
}

export const THEME_STORAGE_KEY = 'theme_mode' as const;
