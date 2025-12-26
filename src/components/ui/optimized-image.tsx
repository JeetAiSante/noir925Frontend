import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  priority?: boolean;
  sizes?: string;
  blurPlaceholder?: boolean;
}

// Generate srcset for responsive images
const generateSrcSet = (src: string): string | undefined => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return undefined;
  
  // For Unsplash images, use their sizing API
  if (src.includes('unsplash.com')) {
    const baseUrl = src.split('?')[0];
    return `${baseUrl}?w=400&fit=crop&auto=format 400w, ${baseUrl}?w=800&fit=crop&auto=format 800w, ${baseUrl}?w=1200&fit=crop&auto=format 1200w, ${baseUrl}?w=1600&fit=crop&auto=format 1600w`;
  }
  
  // For Supabase storage or other URLs, return undefined (single source)
  return undefined;
};

// Default sizes for responsive images
const getDefaultSizes = (aspectRatio: string): string => {
  switch (aspectRatio) {
    case 'square':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'portrait':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'video':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw';
    default:
      return '100vw';
  }
};

const OptimizedImage = memo(({
  src,
  alt,
  fallback = '/placeholder.svg',
  aspectRatio = 'auto',
  priority = false,
  sizes,
  blurPlaceholder = true,
  className,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '300px', // Load images 300px before they enter viewport
        threshold: 0.01,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [priority]);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  const srcSet = generateSrcSet(src);
  const imageSizes = sizes || getDefaultSizes(aspectRatio);

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Blur placeholder skeleton */}
      {blurPlaceholder && !isLoaded && (
        <div 
          className="absolute inset-0 shimmer-skeleton"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--muted)) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          srcSet={srcSet}
          sizes={srcSet ? imageSizes : undefined}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;