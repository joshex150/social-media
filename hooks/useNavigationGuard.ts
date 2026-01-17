import { useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';

/**
 * Custom hook to prevent double navigation
 * Tracks navigation state and prevents multiple rapid navigation calls
 */
export function useNavigationGuard() {
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const lastNavigationTimeRef = useRef(0);
  const lastNavigationPathRef = useRef<string | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Minimum time between navigations (ms)
  const NAVIGATION_DEBOUNCE_MS = 300;

  const clearNavigationState = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
    // Reset navigation state after a delay
    setTimeout(() => {
      isNavigatingRef.current = false;
      lastNavigationPathRef.current = null;
    }, NAVIGATION_DEBOUNCE_MS);
  }, []);

  // Normalize path by removing query params for comparison
  const normalizePath = useCallback((path: string | null | undefined): string | null => {
    if (!path) return null;
    // Remove query parameters for comparison
    return path.split('?')[0];
  }, []);

  const safeNavigate = useCallback(
    (
      navigationFn: () => void,
      path?: string,
      options?: { force?: boolean; replace?: boolean }
    ) => {
      const now = Date.now();
      const timeSinceLastNav = now - lastNavigationTimeRef.current;
      
      // Normalize paths for comparison (ignore query params)
      const normalizedPath = normalizePath(path);
      const normalizedLastPath = normalizePath(lastNavigationPathRef.current);
      const isSamePath = normalizedPath && normalizedLastPath && normalizedPath === normalizedLastPath;

      // Prevent navigation if:
      // 1. Already navigating (unless forced)
      // 2. Same base path was navigated to recently (unless forced)
      // 3. Too soon since last navigation (unless forced)
      if (!options?.force) {
        if (isNavigatingRef.current) {
          console.warn('[NavigationGuard] Navigation blocked: already navigating');
          return false;
        }

        if (isSamePath && timeSinceLastNav < NAVIGATION_DEBOUNCE_MS) {
          console.warn('[NavigationGuard] Navigation blocked: same path, too soon');
          return false;
        }

        if (timeSinceLastNav < NAVIGATION_DEBOUNCE_MS) {
          console.warn('[NavigationGuard] Navigation blocked: too soon since last navigation');
          return false;
        }
      }

      // Set navigation state
      isNavigatingRef.current = true;
      lastNavigationTimeRef.current = now;
      if (path) {
        lastNavigationPathRef.current = path;
      }

      // Clear previous timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Execute navigation
      try {
        navigationFn();
      } catch (error) {
        console.error('[NavigationGuard] Navigation error:', error);
        isNavigatingRef.current = false;
        lastNavigationPathRef.current = null;
        return false;
      }

      // Reset navigation state after debounce period
      navigationTimeoutRef.current = setTimeout(() => {
        clearNavigationState();
      }, NAVIGATION_DEBOUNCE_MS);

      return true;
    },
    [clearNavigationState, normalizePath]
  );

  const safePush = useCallback(
    (path: string, options?: { force?: boolean }) => {
      return safeNavigate(() => router.push(path as any), path, options);
    },
    [router, safeNavigate]
  );

  const safeReplace = useCallback(
    (path: string, options?: { force?: boolean }) => {
      return safeNavigate(() => router.replace(path as any), path, { ...options, replace: true });
    },
    [router, safeNavigate]
  );

  const safeBack = useCallback(
    (options?: { force?: boolean }) => {
      return safeNavigate(() => router.back(), undefined, options);
    },
    [router, safeNavigate]
  );

  // Reset navigation state (useful for cleanup)
  const reset = useCallback(() => {
    isNavigatingRef.current = false;
    lastNavigationTimeRef.current = 0;
    lastNavigationPathRef.current = null;
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, []);

  return {
    safePush,
    safeReplace,
    safeBack,
    isNavigating: () => isNavigatingRef.current,
    reset,
  };
}
