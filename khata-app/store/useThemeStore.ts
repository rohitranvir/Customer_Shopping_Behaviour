import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

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
      const stored = await AsyncStorage.getItem('color_scheme');
      const scheme = (stored as ColorScheme) ?? 'system';
      set({ colorScheme: scheme, isDark: resolveIsDark(scheme) });
    } catch {}
  },

  setColorScheme: async (scheme: ColorScheme) => {
    await AsyncStorage.setItem('color_scheme', scheme);
    set({ colorScheme: scheme, isDark: resolveIsDark(scheme) });
  },
}));
