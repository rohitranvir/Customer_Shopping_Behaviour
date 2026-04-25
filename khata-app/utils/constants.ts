export const APP_NAME = 'Khata Book';
export const APP_VERSION = '1.0.0';

export const COLORS = {
  primary: '#2563eb', // OkCredit Blue
  primaryDark: '#1e40af',
  primaryLight: '#dbeafe',
  credit: '#16a34a',
  creditLight: '#dcfce7',
  debit: '#dc2626',
  debitLight: '#fee2e2',
  surface: '#ffffff',
  surfaceSecondary: '#f8fafc',
  border: '#e2e8f0',
  ink: '#0f172a',
  inkMuted: '#64748b',
  inkLight: '#94a3b8',
  white: '#ffffff',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT',
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

export const PIN_LENGTH = 4;

export const NOTIFICATION_CHANNEL_ID = 'khata-due-reminders';

// Max transactions to show in recent activity
export const RECENT_TX_LIMIT = 5;
