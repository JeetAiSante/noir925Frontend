import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FestivalTheme {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  banner_image: string | null;
  logo_overlay: string | null;
  discount_percent: number | null;
  special_offer: string | null;
  is_active: boolean;
}

interface FestivalThemeContextType {
  activeTheme: FestivalTheme | null;
  isLoading: boolean;
}

const FestivalThemeContext = createContext<FestivalThemeContextType | undefined>(undefined);

export const FestivalThemeProvider = ({ children }: { children: ReactNode }) => {
  const [activeTheme, setActiveTheme] = useState<FestivalTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveTheme = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('festival_themes')
          .select('*')
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .limit(1)
          .single();

        if (!error && data) {
          setActiveTheme(data);
          applyThemeColors(data);
        }
      } catch (error) {
        console.error('Error fetching festival theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveTheme();

    // Subscribe to theme changes
    const channel = supabase
      .channel('festival-themes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'festival_themes' },
        () => {
          fetchActiveTheme();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const applyThemeColors = (theme: FestivalTheme) => {
    const root = document.documentElement;
    
    // Convert hex to HSL and apply to CSS variables
    const hexToHsl = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return '';
      
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply festival theme colors as CSS custom properties
    if (theme.primary_color) {
      root.style.setProperty('--festival-primary', hexToHsl(theme.primary_color));
    }
    if (theme.secondary_color) {
      root.style.setProperty('--festival-secondary', hexToHsl(theme.secondary_color));
    }
    if (theme.accent_color) {
      root.style.setProperty('--festival-accent', hexToHsl(theme.accent_color));
    }
    if (theme.background_color) {
      root.style.setProperty('--festival-background', hexToHsl(theme.background_color));
    }
  };

  return (
    <FestivalThemeContext.Provider value={{ activeTheme, isLoading }}>
      {children}
    </FestivalThemeContext.Provider>
  );
};

export const useFestivalTheme = () => {
  const context = useContext(FestivalThemeContext);
  if (!context) {
    throw new Error('useFestivalTheme must be used within a FestivalThemeProvider');
  }
  return context;
};
