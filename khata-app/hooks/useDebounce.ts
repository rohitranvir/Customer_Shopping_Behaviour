import { useRef } from 'react';

/**
 * Returns a debounced version of the given function.
 * Fires only after the user has stopped calling it for `delay` ms.
 *
 * Usage:
 *   const debouncedSearch = useDebounce((q: string) => search(q), 300);
 */
export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
