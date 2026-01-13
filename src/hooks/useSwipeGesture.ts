import { useRef, useCallback, TouchEvent } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  preventScroll = false,
}: SwipeGestureOptions) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwiping.current) return;
    
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
    
    // Calculate if horizontal swipe is dominant
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    if (preventScroll && deltaX > deltaY) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    
    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Only trigger if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
    
    isSwiping.current = false;
    touchEndX.current = 0;
    touchEndY.current = 0;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
