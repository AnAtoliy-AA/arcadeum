import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME_NAME, ThemePreference } from '@/shared/config/theme';

interface ThemeState {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themePreference: DEFAULT_THEME_NAME,
      setThemePreference: (preference) => set({ themePreference: preference }),
    }),
    {
      name: 'app-theme-storage',
    },
  ),
);
