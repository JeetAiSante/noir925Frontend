import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  className?: string;
}

export const ProductSkeleton = ({ className }: ProductSkeletonProps) => {
  return (
    <div className={cn("animate-pulse", className)}>
      {/* Image skeleton with shimmer */}
      <div className="relative aspect-square rounded-xl bg-muted overflow-hidden mb-4">
        <div className="absolute inset-0 shimmer-skeleton" />
      </div>
      
      {/* Category */}
      <div className="h-3 w-16 bg-muted rounded mb-2">
        <div className="absolute inset-0 shimmer-skeleton" />
      </div>
      
      {/* Title */}
      <div className="h-5 w-3/4 bg-muted rounded mb-3">
        <div className="absolute inset-0 shimmer-skeleton" />
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-muted rounded-sm" />
          ))}
        </div>
        <div className="h-3 w-8 bg-muted rounded" />
      </div>
      
      {/* Price */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 bg-muted rounded" />
        <div className="h-4 w-14 bg-muted rounded" />
      </div>
    </div>
  );
};

export const BannerSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-muted", className)}>
      <div className="absolute inset-0 shimmer-skeleton" />
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col items-center gap-3">
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-muted relative overflow-hidden">
        <div className="absolute inset-0 shimmer-skeleton" />
      </div>
      <div className="h-4 w-16 bg-muted rounded" />
    </div>
  );
};

export const ReviewSkeleton = () => {
  return (
    <div className="animate-pulse glass-heavy rounded-2xl p-8">
      {/* Quote icon placeholder */}
      <div className="w-12 h-12 bg-muted rounded mb-6" />
      
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-muted rounded" />
        ))}
      </div>
      
      {/* Title */}
      <div className="h-6 w-2/3 bg-muted rounded mb-4" />
      
      {/* Review text */}
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-4/6 bg-muted rounded" />
      </div>
      
      {/* Author */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div>
          <div className="h-4 w-24 bg-muted rounded mb-2" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};

export const ImageSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <div className="absolute inset-0 shimmer-skeleton" />
    </div>
  );
};
