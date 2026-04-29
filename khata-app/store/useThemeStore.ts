import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

// Theme preference is NOT sensitive data — AsyncStorage is fine here
const THEME_KEY = 'color_scheme';

type ColorScheme = 'system' | 'light' | 'dark';

interface ThemeState {
  colorScheme: ColorScheme;
  isDark: boolean;
  setColorScheme: (scheme: ColorScheme) => Promise<void>;
  loadTheme: () => Promise<void>;
}

function resolveIsDark(scheme: ColorScheme): boolean {
  if (scheme === 'dark') return true;
  if (scheme === 'light') return false;
  return Appearance.getColorScheme() === 'dark';
}

export const useThemeStore = create<ThemeState>((set) => ({
  colorScheme: 'system',
  isDark: Appearance.getColorScheme() === 'dark',

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      const scheme = (stored as ColorScheme) ?? 'system';
      set({ colorScheme: scheme, isDark: resolveIsDark(scheme) });
    } catch {}
  },

  setColorScheme: async (scheme: ColorScheme) => {
    await AsyncStorage.setItem(THEME_KEY, scheme);
    set({ colorScheme: scheme, isDark: resolveIsDark(scheme) });
  },
}));
