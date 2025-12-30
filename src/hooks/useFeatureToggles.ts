import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureToggle {
  id: string;
  feature_key: string;
  feature_name: string;
  description: string | null;
  is_enabled: boolean;
}

export const useFeatureToggles = () => {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .order('feature_name');

      if (!error && data) {
        setFeatures(data);
      }
      setLoading(false);
    };

    fetchFeatures();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('feature_toggles_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feature_toggles' },
        () => {
          fetchFeatures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isEnabled = (featureKey: string): boolean => {
    const feature = features.find((f) => f.feature_key === featureKey);
    return feature?.is_enabled ?? true; // Default to true if not found
  };

  return { features, loading, isEnabled };
};

export default useFeatureToggles;
