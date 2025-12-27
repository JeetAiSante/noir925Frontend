import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeatureToggle {
  id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  description: string | null;
}

export const useFeatureToggles = () => {
  return useQuery({
    queryKey: ['feature-toggles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('*');
      
      if (error) throw error;
      return data as FeatureToggle[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useFeatureToggle = (featureKey: string) => {
  const { data: features = [], isLoading } = useFeatureToggles();
  
  const feature = features.find(f => f.feature_key === featureKey);
  
  return {
    isEnabled: feature?.is_enabled ?? true, // Default to enabled if not found
    isLoading,
    feature,
  };
};

export const useIsFeatureEnabled = (featureKey: string): boolean => {
  const { isEnabled } = useFeatureToggle(featureKey);
  return isEnabled;
};
