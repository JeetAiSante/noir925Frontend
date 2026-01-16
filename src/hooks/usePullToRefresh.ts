import { useState, useRef, useCallback, useEffect, TouchEvent } from 'react';
import { triggerHapticFeedback } from './useSwipeGesture';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: PullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false,
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredHaptic = useRef<boolean>(false);

  const isAtTop = useCallback(() => {
    if (!containerRef.current) return window.scrollY === 0;
    return containerRef.current.scrollTop === 0 && window.scrollY === 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (disabled || state.isRefreshing) return;
    
    if (isAtTop()) {
      startY.current = e.touches[0].clientY;
      hasTriggeredHaptic.current = false;
      setState(prev => ({ ...prev, isPulling: true }));
    }
  }, [disabled, state.isRefreshing, isAtTop]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (disabled || state.isRefreshing || !state.isPulling) return;
    if (!isAtTop()) {
      setState(prev => ({ ...prev, isPulling: false, pullDistance: 0 }));
      return;
    }

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    // Apply resistance to create elastic feel
    const pullDistance = Math.min(maxPull, distance * 0.5);
    const canRefresh = pullDistance >= threshold;

    // Trigger haptic when crossing threshold
    if (canRefresh && !hasTriggeredHaptic.current) {
      triggerHapticFeedback('medium');
      hasTriggeredHaptic.current = true;
    } else if (!canRefresh && hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = false;
    }

    setState(prev => ({ ...prev, pullDistance, canRefresh }));
    
    // Prevent default scrolling when pulling
    if (pullDistance > 10) {
      e.preventDefault();
    }
  }, [disabled, state.isRefreshing, state.isPulling, isAtTop, maxPull, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing) return;

    if (state.canRefresh) {
      triggerHapticFeedback('heavy');
      setState(prev => ({ ...prev, isRefreshing: true, isPulling: false }));
      
      try {
        await onRefresh();
      } finally {
        // Brief delay for visual feedback
        setTimeout(() => {
          setState({
            isPulling: false,
            pullDistance: 0,
            isRefreshing: false,
            canRefresh: false,
          });
        }, 300);
      }
    } else {
      setState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false,
      });
    }
  }, [disabled, state.isRefreshing, state.canRefresh, onRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
        canRefresh: false,
      });
    };
  }, []);

  const pullProgress = Math.min(1, state.pullDistance / threshold);

  return {
    containerRef,
    pullDistance: state.pullDistance,
    isRefreshing: state.isRefreshing,
    isPulling: state.isPulling,
    canRefresh: state.canRefresh,
    pullProgress,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
