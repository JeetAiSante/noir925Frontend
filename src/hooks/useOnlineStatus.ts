import { useState, useEffect } from 'react';
import { isOnline, onOnlineStatusChange } from '@/utils/offlineCache';

/**
 * Hook that tracks online/offline status and shows
 * a toast when connectivity changes.
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    return onOnlineStatusChange((status) => {
      setOnline(status);
    });
  }, []);

  return online;
}
