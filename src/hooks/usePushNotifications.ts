import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface PushState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
}

/**
 * Unified push notification hook.
 * - On native (Capacitor): uses @capacitor/push-notifications
 * - On web: uses the Push API with service worker
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
  });

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      // Native push is handled by Capacitor plugin at app level
      setState((s) => ({ ...s, isSupported: true }));
      return;
    }

    // Web push support check
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setState((s) => ({
      ...s,
      isSupported: supported,
      permission: supported ? Notification.permission : 'default',
    }));
  }, [isNative]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || isNative) return false;

    try {
      const permission = await Notification.requestPermission();
      setState((s) => ({ ...s, permission }));

      if (permission !== 'granted') return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userActivated: true,
        applicationServerKey: undefined, // VAPID key would go here
      } as any);

      const subJson = subscription.toJSON();

      // Save subscription to database
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from('push_subscriptions').upsert({
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys?.p256dh || '',
        auth_key: subJson.keys?.auth || '',
        user_id: session?.user?.id || null,
        is_active: true,
      }, { onConflict: 'endpoint' });

      setState((s) => ({ ...s, isSubscribed: true }));
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    }
  }, [state.isSupported, isNative]);

  return {
    ...state,
    subscribe,
  };
}
