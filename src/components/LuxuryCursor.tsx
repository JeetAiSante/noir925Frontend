import { useEffect, useState, useCallback } from 'react';

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
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorState>({
    isHoveringProduct: false,
    isHoveringButton: false,
    isHoveringCard: false,
    isClicking: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  const updateCursorState = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isProduct = target.closest('[data-cursor="product"]') !== null;
    const isButton = target.closest('button, a, [data-cursor="button"]') !== null;
    const isCard = target.closest('[data-cursor="card"]') !== null;

    setCursorState(prev => ({
      ...prev,
      isHoveringProduct: isProduct,
      isHoveringButton: isButton && !isProduct,
      isHoveringCard: isCard && !isProduct && !isButton,
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      updateCursorState(e);
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, isClicking: true }));
      // Add sparkle on click
      const newSparkle = { id: Date.now(), x: position.x, y: position.y };
      setSparkles(prev => [...prev, newSparkle]);
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 600);
    };

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, isClicking: false }));
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [position.x, position.y, updateCursorState]);

  // Smooth trail effect
  useEffect(() => {
    const animateTrail = () => {
      setTrailPosition(prev => ({
        x: prev.x + (position.x - prev.x) * 0.15,
        y: prev.y + (position.y - prev.y) * 0.15,
      }));
    };

    const interval = setInterval(animateTrail, 16);
    return () => clearInterval(interval);
  }, [position]);

  // Hide on touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  if (isTouchDevice) return null;

  const getCursorSize = () => {
    if (cursorState.isHoveringProduct) return 'w-16 h-16';
    if (cursorState.isHoveringButton) return 'w-12 h-12';
    if (cursorState.isHoveringCard) return 'w-10 h-10';
    if (cursorState.isClicking) return 'w-6 h-6';
    return 'w-8 h-8';
  };

  const getCursorStyle = () => {
    if (cursorState.isHoveringProduct) {
      return 'bg-secondary/20 border-secondary shadow-glow-rose';
    }
    if (cursorState.isHoveringButton) {
      return 'bg-accent/20 border-accent shadow-glow-gold';
    }
    if (cursorState.isHoveringCard) {
      return 'bg-silver/20 border-silver';
    }
    return 'bg-primary/10 border-primary/40';
  };

  return (
    <>
      {/* Add global cursor:none style */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Main cursor */}
      <div
        className={`fixed pointer-events-none z-[9999] rounded-full border-2 transition-all duration-200 ${getCursorSize()} ${getCursorStyle()}`}
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 1 : 0,
        }}
      >
        {/* Inner dot */}
        <div 
          className={`absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-foreground/60 transition-transform duration-200 ${
            cursorState.isClicking ? 'scale-150' : 'scale-100'
          }`}
        />

        {/* Bloom effect for product hover */}
        {cursorState.isHoveringProduct && (
          <div className="absolute inset-0 -m-4">
            <div className="absolute inset-0 animate-bloom rounded-full bg-secondary/30" />
            <div className="absolute inset-2 animate-bloom delay-100 rounded-full bg-secondary/20" />
          </div>
        )}

        {/* Ripple for button hover */}
        {cursorState.isHoveringButton && (
          <div className="absolute inset-0 animate-pulse-soft rounded-full border border-accent/50" />
        )}
      </div>

      {/* Trail cursor */}
      <div
        className="fixed pointer-events-none z-[9998] w-4 h-4 rounded-full bg-silver/30 transition-opacity duration-300"
        style={{
          left: trailPosition.x,
          top: trailPosition.y,
          transform: 'translate(-50%, -50%)',
          opacity: isVisible ? 0.5 : 0,
        }}
      />

      {/* Click sparkles */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-accent animate-sparkle"
              style={{
                transform: `rotate(${i * 60}deg) translateY(-12px)`,
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default LuxuryCursor;
