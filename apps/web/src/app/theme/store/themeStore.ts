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
      // Let's stick to a clean new key for the store to avoid JSON parsing issues with legacy format if it differs.
      name: 'app-theme-storage',
    },
  ),
);
