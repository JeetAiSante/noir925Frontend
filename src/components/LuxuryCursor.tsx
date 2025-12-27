import { useEffect, useState, useCallback, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorState {
  isHoveringProduct: boolean;
  isHoveringButton: boolean;
  isHoveringCard: boolean;
  isClicking: boolean;
}

const LuxuryCursor = () => {
  const [position, setPosition] = useState<CursorPosition>({ x: -100, y: -100 });
  const [cursorState, setCursorState] = useState<CursorState>({
    isHoveringProduct: false,
    isHoveringButton: false,
    isHoveringCard: false,
    isClicking: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const trailRef = useRef<CursorPosition>({ x: -100, y: -100 });
  const rafRef = useRef<number>();
  const isMobile = useIsMobile();

  // Detect touch/mobile devices - completely disable on mobile
  useEffect(() => {
    // Always disable on mobile
    if (isMobile) {
      setIsTouchDevice(true);
      return;
    }

    const checkTouchDevice = () => {
      const hasTouchScreen = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0;
      
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const isSmallScreen = window.innerWidth < 1024;
      
      setIsTouchDevice(hasTouchScreen || isMobileUA || isCoarsePointer || isSmallScreen);
    };

    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, [isMobile]);

  const updateCursorState = useCallback((target: HTMLElement) => {
    const isProduct = target.closest('[data-cursor="product"]') !== null;
    const isButton = target.closest('button, a, [data-cursor="button"], [role="button"]') !== null;
    const isCard = target.closest('[data-cursor="card"]') !== null;

    setCursorState(prev => ({
      ...prev,
      isHoveringProduct: isProduct,
      isHoveringButton: isButton && !isProduct,
      isHoveringCard: isCard && !isProduct && !isButton,
    }));
  }, []);

  useEffect(() => {
    if (isTouchDevice || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      updateCursorState(e.target as HTMLElement);
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, isClicking: false }));
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isTouchDevice, isMobile, updateCursorState]);

  // Optimized RAF-based trail animation
  useEffect(() => {
    if (isTouchDevice || isMobile) return;

    const animate = () => {
      trailRef.current = {
        x: trailRef.current.x + (position.x - trailRef.current.x) * 0.25,
        y: trailRef.current.y + (position.y - trailRef.current.y) * 0.25,
      };
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [position, isTouchDevice, isMobile]);

  // Don't render on touch/mobile devices
  if (isTouchDevice || isMobile) return null;

  const getCursorSize = () => {
    if (cursorState.isClicking) return 20;
    if (cursorState.isHoveringProduct) return 48;
    if (cursorState.isHoveringButton) return 36;
    if (cursorState.isHoveringCard) return 32;
    return 24;
  };

  const getCursorColor = () => {
    if (cursorState.isHoveringProduct) return 'rgba(244, 114, 182, 0.3)';
    if (cursorState.isHoveringButton) return 'rgba(212, 175, 55, 0.3)';
    if (cursorState.isHoveringCard) return 'rgba(192, 192, 192, 0.3)';
    return 'rgba(30, 30, 30, 0.15)';
  };

  const getBorderColor = () => {
    if (cursorState.isHoveringProduct) return 'rgba(244, 114, 182, 0.8)';
    if (cursorState.isHoveringButton) return 'rgba(212, 175, 55, 0.8)';
    if (cursorState.isHoveringCard) return 'rgba(192, 192, 192, 0.6)';
    return 'rgba(30, 30, 30, 0.4)';
  };

  const size = getCursorSize();

  return (
    <>
      <style>{`
        @media (pointer: fine) and (min-width: 1024px) {
          * { cursor: none !important; }
        }
      `}</style>

      {/* Main cursor - GPU accelerated */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: size,
          height: size,
          backgroundColor: getCursorColor(),
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate3d(${position.x - size / 2}px, ${position.y - size / 2}px, 0)`,
          transition: 'width 0.15s, height 0.15s, background-color 0.15s, border-color 0.15s',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
        }}
      >
        {/* Inner dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: cursorState.isClicking ? 8 : 4,
            height: cursorState.isClicking ? 8 : 4,
            backgroundColor: 'rgba(30, 30, 30, 0.7)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.1s, height 0.1s',
          }}
        />
      </div>

      {/* Trail cursor - follows with delay */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 12,
          height: 12,
          backgroundColor: 'rgba(192, 192, 192, 0.4)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: `translate3d(${trailRef.current.x - 6}px, ${trailRef.current.y - 6}px, 0)`,
          opacity: isVisible ? 0.6 : 0,
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default LuxuryCursor;
