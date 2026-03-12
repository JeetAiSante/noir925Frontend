import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface LoyaltySettings {
  points_per_rupee: number;
  points_value_per_rupee: number;
  min_points_to_redeem: number;
  max_discount_percent: number;
  welcome_bonus_points: number;
  is_enabled: boolean;
}

interface UserLoyaltyPoints {
  id: string;
  user_id: string;
  total_points: number;
  redeemed_points: number;
  available_points: number;
  tier: string;
}

export const useLoyaltySettings = () => {
  return useQuery({
    queryKey: ['loyalty-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LoyaltySettings | null;
    },
    staleTime: 60000,
  });
};

export const useUserLoyaltyPoints = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-loyalty-points', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserLoyaltyPoints | null;
    },
    enabled: !!user,
    staleTime: 30000,
  });
};

export const useEarnPoints = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ orderTotal, orderId }: { orderTotal: number; orderId: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Get loyalty settings
      const { data: settings } = await supabase
        .from('loyalty_settings')
        .select('*')
        .limit(1)
        .single();

      if (!settings?.is_enabled) return null;

      const pointsEarned = Math.floor(orderTotal * settings.points_per_rupee);

      // Use secure RPC to earn points (handles both insert and update)
      const { error } = await supabase.rpc('earn_loyalty_points', {
        _user_id: user.id,
        _points_earned: pointsEarned,
        _welcome_bonus: settings.welcome_bonus_points || 0,
      });

      if (error) throw error;

      return pointsEarned;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
    },
  });
};

export const useRedeemPoints = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ points, orderId }: { points: number; orderId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Use the secure RPC function to redeem points (bypasses dropped UPDATE policy)
      const { data: success, error } = await supabase.rpc('redeem_loyalty_points', {
        _user_id: user.id,
        _points_to_redeem: points,
      });

      if (error) throw error;
      if (!success) throw new Error('Insufficient points');

      // Get settings for value calculation
      const { data: settings } = await supabase
        .from('loyalty_settings')
        .select('points_value_per_rupee')
        .limit(1)
        .single();

      const discountValue = Math.floor(points * (settings?.points_value_per_rupee || 0.25));

      return { points, discountValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
    },
  });
};
