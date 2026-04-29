import { COLORS } from './constants';

export const getThemeColors = (isDark: boolean) => ({
  bg: isDark ? '#0f172a' : COLORS.surfaceSecondary,
  surface: isDark ? '#1e293b' : COLORS.surface,
  border: isDark ? '#334155' : COLORS.border,
  text: isDark ? '#f1f5f9' : COLORS.ink,
  muted: isDark ? '#94a3b8' : COLORS.inkMuted,
  primary: isDark ? '#60a5fa' : COLORS.primary,
  success: isDark ? '#4ade80' : COLORS.credit,
  danger: isDark ? '#f87171' : COLORS.debit,
  input: isDark ? '#0f172a' : COLORS.surfaceSecondary, // dark input background
});
