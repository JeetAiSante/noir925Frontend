import { useState, useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface ProductVideoPreviewProps {
  videoUrl?: string;
  posterImage: string;
  isHovered: boolean;
  className?: string;
}

const ProductVideoPreview = ({ 
  videoUrl, 
  posterImage, 
  isHovered,
  className = ''
}: ProductVideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Generate a placeholder video simulation using image transitions
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    if (isHovered && !videoUrl) {
      // Simulate video with image cycling
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % 3);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isHovered, videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isHovered]);

  if (videoUrl) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterImage}
          muted={isMuted}
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        
        {isPlaying && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 bg-black/50 rounded-full">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback: Animated image preview
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <img
        src={posterImage}
        alt=""
        className={`w-full h-full object-cover transition-all duration-500 ${
          isHovered ? 'scale-110 brightness-105' : 'scale-100'
        }`}
        style={{
          filter: isHovered ? `hue-rotate(${currentImageIndex * 5}deg)` : 'none'
        }}
      />
      
      {isHovered && (
        <>
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
          
          {/* Play indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            PREVIEW
          </div>
        </>
      )}
    </div>
  );
};

export default ProductVideoPreview;
