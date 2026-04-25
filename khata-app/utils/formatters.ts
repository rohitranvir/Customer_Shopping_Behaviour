/**
 * Format a number as Indian Rupee currency
 * e.g. 123456.78 → ₹1,23,456.78
 */
export function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}`;
}

/**
 * Format a number as short INR (K/L notation)
 * e.g. 150000 → ₹1.5L
 */
export function formatINRShort(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10_00_000) {
    return `₹${(abs / 10_00_000).toFixed(1)}Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${(abs / 1_00_000).toFixed(1)}L`;
  }
  if (abs >= 1_000) {
    return `₹${(abs / 1_000).toFixed(1)}K`;
  }
  return formatINR(abs);
}

/**
 * Format ISO date (YYYY-MM-DD) to Indian format (DD MMM YYYY)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format ISO datetime to short relative date
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDate(dateStr);
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get initials from a name (max 2 chars)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Get a deterministic color (from arr) based on string
 */
const AVATAR_COLORS = [
  '#f97316', '#16a34a', '#2563eb', '#9333ea',
  '#db2777', '#0891b2', '#65a30d', '#dc2626',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
