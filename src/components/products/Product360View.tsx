import { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Pause, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface Product360ViewProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Product360View = ({ images, open, onOpenChange }: Product360ViewProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 360 frames by cycling through available images
  const frames = images.length > 0 
    ? [...images, ...images, ...images].slice(0, Math.max(8, images.length))
    : images;

  useEffect(() => {
    if (open && isPlaying && !isDragging) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, 150);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open, isPlaying, isDragging, frames.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastX(e.clientX);
    setIsPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const delta = e.clientX - lastX;
    const sensitivity = 5;
    
    if (Math.abs(delta) > sensitivity) {
      const direction = delta > 0 ? 1 : -1;
      setCurrentFrame(prev => (prev + direction + frames.length) % frames.length);
      setLastX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setLastX(e.touches[0].clientX);
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const delta = e.touches[0].clientX - lastX;
    const sensitivity = 5;
    
    if (Math.abs(delta) > sensitivity) {
      const direction = delta > 0 ? 1 : -1;
      setCurrentFrame(prev => (prev + direction + frames.length) % frames.length);
      setLastX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetRotation = () => {
    setCurrentFrame(0);
    setIsPlaying(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 bg-background overflow-hidden">
        <DialogTitle className="sr-only">360° Product View</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold">360° View</h3>
            <p className="text-sm text-muted-foreground">Drag to rotate or use controls</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetRotation}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 360 Viewer */}
        <div 
          ref={containerRef}
          className="relative aspect-square bg-champagne/10 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={frames[currentFrame]}
            alt={`360 view frame ${currentFrame + 1}`}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
          
          {/* 360 Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
            <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-medium">360°</span>
          </div>

          {/* Drag hint */}
          {!isDragging && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-background/90 backdrop-blur-sm px-6 py-3 rounded-lg text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Drag to rotate</p>
              </div>
            </div>
          )}
        </div>

        {/* Rotation Slider */}
        <div className="p-4 border-t border-border">
          <Slider
            value={[currentFrame]}
            max={frames.length - 1}
            step={1}
            onValueChange={([value]) => {
              setCurrentFrame(value);
              setIsPlaying(false);
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0°</span>
            <span>Frame {currentFrame + 1} of {frames.length}</span>
            <span>360°</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Product360View;
