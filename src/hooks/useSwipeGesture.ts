import { useRef, useCallback, TouchEvent } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventScroll?: boolean;
  enableHaptic?: boolean;
}

// Haptic feedback utility
const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    const durations = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(durations[intensity]);
  }
};

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  preventScroll = false,
  enableHaptic = true,
}: SwipeGestureOptions) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const hasTriggeredHaptic = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
    hasTriggeredHaptic.current = false;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current) return;
    
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // Calculate if horizontal swipe is dominant
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Trigger haptic when crossing threshold during swipe
    if (enableHaptic && !hasTriggeredHaptic.current && deltaX > deltaY && deltaX > threshold * 0.6) {
      triggerHapticFeedback('light');
      hasTriggeredHaptic.current = true;
    }
    
    if (preventScroll && deltaX > deltaY) {
      e.preventDefault();
    }
  }, [preventScroll, enableHaptic, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Only trigger if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > threshold) {
      // Trigger haptic on successful swipe
      if (enableHaptic) {
        triggerHapticFeedback('medium');
      }
      
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    isSwiping.current = false;
    hasTriggeredHaptic.current = false;
    touchEndX.current = 0;
    touchEndY.current = 0;
  }, [onSwipeLeft, onSwipeRight, threshold, enableHaptic]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

// Export utility for use in other components
export { triggerHapticFeedback };
