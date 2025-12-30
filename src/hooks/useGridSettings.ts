import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GridSettings {
  desktop: number;
  tablet: number;
  mobile: number;
}

const defaultSettings: GridSettings = {
  desktop: 4,
  tablet: 3,
  mobile: 2,
};

export const useGridSettings = () => {
  const [settings, setSettings] = useState<GridSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'grid_columns_settings')
        .single();

      if (!error && data?.value) {
        const val = data.value as unknown as GridSettings;
        if (val.desktop && val.tablet && val.mobile) {
          setSettings(val);
        }
      }
      setLoading(false);
    };

    fetchSettings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('grid_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings', filter: "key=eq.grid_columns_settings" },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            setSettings((payload.new as any).value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getGridClasses = () => {
    const desktopCols = `xl:grid-cols-${settings.desktop}`;
    const tabletCols = `md:grid-cols-${settings.tablet}`;
    const mobileCols = `grid-cols-${settings.mobile}`;
    
    return `${mobileCols} ${tabletCols} ${desktopCols}`;
  };

  const getGridStyle = () => {
    return {
      '--grid-cols-mobile': settings.mobile,
      '--grid-cols-tablet': settings.tablet,
      '--grid-cols-desktop': settings.desktop,
    } as React.CSSProperties;
  };

  return { settings, loading, getGridClasses, getGridStyle };
};

export default useGridSettings;
