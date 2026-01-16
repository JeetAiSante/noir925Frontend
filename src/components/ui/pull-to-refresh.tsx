import { motion } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
  pullProgress: number;
  threshold?: number;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  canRefresh,
  pullProgress,
  threshold = 80,
}: PullToRefreshIndicatorProps) => {
  const opacity = Math.min(1, pullProgress * 1.5);
  const scale = 0.5 + pullProgress * 0.5;
  const translateY = Math.min(pullDistance - 40, threshold - 40);

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] flex justify-center pt-20 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: opacity,
        y: isRefreshing ? threshold - 40 : translateY,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full shadow-lg border",
          isRefreshing 
            ? "bg-primary border-primary/20" 
            : canRefresh 
              ? "bg-primary border-primary/20"
              : "bg-background border-border"
        )}
        style={{ scale }}
        animate={isRefreshing ? { rotate: 360 } : { rotate: pullProgress * 180 }}
        transition={isRefreshing ? { 
          rotate: { duration: 1, repeat: Infinity, ease: "linear" }
        } : {
          type: 'spring',
          damping: 15,
        }}
      >
        {isRefreshing ? (
          <RefreshCw className="w-5 h-5 text-primary-foreground" />
        ) : canRefresh ? (
          <RefreshCw className="w-5 h-5 text-primary-foreground" />
        ) : (
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        )}
      </motion.div>
    </motion.div>
  );
};

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  pullDistance: number;
  isRefreshing: boolean;
  className?: string;
}

export const PullToRefreshWrapper = ({
  children,
  pullDistance,
  isRefreshing,
  className,
}: PullToRefreshWrapperProps) => {
  return (
    <motion.div
      className={cn("relative", className)}
      animate={{
        y: isRefreshing ? 60 : pullDistance * 0.3,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
    >
      {children}
    </motion.div>
  );
};
