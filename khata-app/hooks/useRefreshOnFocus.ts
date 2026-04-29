import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Runs the given callback every time the screen comes into focus.
 * Use this to refresh stale data when navigating back to a screen.
 *
 * Usage:
 *   useRefreshOnFocus(() => loadCustomers(businessId));
 */
export function useRefreshOnFocus(onFocus: () => void): void {
  useFocusEffect(
    useCallback(() => {
      onFocus();
    }, [onFocus])
  );
}
