import { useRef, useCallback } from 'react';

/**
 * Custom hook to prevent double button presses
 * Returns a wrapped handler that ignores rapid successive calls
 */
export function usePreventDoublePress(
  handler: () => void | Promise<void>,
  delay: number = 500
) {
  const isProcessingRef = useRef(false);
  const lastPressTimeRef = useRef(0);

  const wrappedHandler = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastPress = now - lastPressTimeRef.current;

    // Prevent if already processing or too soon since last press
    if (isProcessingRef.current || timeSinceLastPress < delay) {
      return;
    }

    isProcessingRef.current = true;
    lastPressTimeRef.current = now;

    try {
      await handler();
    } catch (error) {
      console.error('[usePreventDoublePress] Handler error:', error);
    } finally {
      // Reset after delay
      setTimeout(() => {
        isProcessingRef.current = false;
      }, delay);
    }
  }, [handler, delay]);

  return wrappedHandler;
}
