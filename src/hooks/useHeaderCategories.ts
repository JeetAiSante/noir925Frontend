import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeaderCategory {
  id: string;
  name: string;
  slug: string;
  header_icon: string | null;
  header_sort_order: number;
}

export const useHeaderCategories = () => {
  const [categories, setCategories] = useState<HeaderCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, header_icon, header_sort_order')
        .eq('is_active', true)
        .eq('show_in_header', true)
        .order('header_sort_order');

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('header_categories_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { categories, loading };
};

export default useHeaderCategories;
