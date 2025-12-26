import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, any> | null;
}

export const useHomepageSections = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_sections')
          .select('*')
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        
        setSections((data || []).map(s => ({
          ...s,
          settings: s.settings as Record<string, any> | null
        })));
      } catch (error) {
        console.error('Error fetching homepage sections:', error);
        // Return default visible sections
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('homepage_sections_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homepage_sections' },
        () => {
          fetchSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isSectionVisible = (key: string): boolean => {
    // If no sections loaded yet, show all by default
    if (sections.length === 0) return true;
    const section = sections.find(s => s.section_key === key);
    return section?.is_visible ?? false;
  };

  const getSectionSettings = (key: string): Record<string, any> | null => {
    const section = sections.find(s => s.section_key === key);
    return section?.settings ?? null;
  };

  const getSortedSections = () => {
    return sections.sort((a, b) => a.sort_order - b.sort_order);
  };

  return {
    sections,
    loading,
    isSectionVisible,
    getSectionSettings,
    getSortedSections
  };
};
