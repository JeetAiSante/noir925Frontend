import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const OfflineBanner = () => {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      You're offline. Some features may be limited.
    </div>
  );
};

export default OfflineBanner;
