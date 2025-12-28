import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LayoutSettings {
  productsPerRow: number;
  productsPerRowMobile: number;
  productsPerRowTablet: number;
  showLoyaltyBanner: boolean;
}

const defaultSettings: LayoutSettings = {
  productsPerRow: 4,
  productsPerRowMobile: 2,
  productsPerRowTablet: 3,
  showLoyaltyBanner: true,
};

export const useLayoutSettings = () => {
  const [settings, setSettings] = useState<LayoutSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'layout_settings')
          .single();

        if (!error && data?.value) {
          const value = data.value as Record<string, any>;
          setSettings({
            productsPerRow: value.productsPerRow ?? 4,
            productsPerRowMobile: value.productsPerRowMobile ?? 2,
            productsPerRowTablet: value.productsPerRowTablet ?? 3,
            showLoyaltyBanner: value.showLoyaltyBanner ?? true,
          });
        }
      } catch (err) {
        console.error('Error fetching layout settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('layout-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.layout_settings',
        },
        (payload) => {
          if (payload.new && 'value' in payload.new) {
            const value = payload.new.value as Record<string, any>;
            setSettings({
              productsPerRow: value.productsPerRow ?? 4,
              productsPerRowMobile: value.productsPerRowMobile ?? 2,
              productsPerRowTablet: value.productsPerRowTablet ?? 3,
              showLoyaltyBanner: value.showLoyaltyBanner ?? true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Generate grid classes based on settings
  const getGridClasses = () => {
    const desktopCols = settings.productsPerRow;
    const tabletCols = settings.productsPerRowTablet;
    const mobileCols = settings.productsPerRowMobile;

    return `grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols}`;
  };

  // Get inline grid style for dynamic columns
  const getGridStyle = () => ({
    '--products-per-row': settings.productsPerRow,
    '--products-per-row-tablet': settings.productsPerRowTablet,
    '--products-per-row-mobile': settings.productsPerRowMobile,
  } as React.CSSProperties);

  return { 
    settings, 
    loading, 
    getGridClasses,
    getGridStyle,
    showLoyaltyBanner: settings.showLoyaltyBanner,
  };
};
