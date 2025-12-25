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

      // Check if user has loyalty points record
      const { data: existing } = await supabase
        .from('user_loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing points
        await supabase
          .from('user_loyalty_points')
          .update({
            total_points: existing.total_points + pointsEarned,
            available_points: (existing.available_points || 0) + pointsEarned,
          })
          .eq('user_id', user.id);
      } else {
        // Create new record
        await supabase
          .from('user_loyalty_points')
          .insert({
            user_id: user.id,
            total_points: pointsEarned + (settings.welcome_bonus_points || 0),
            available_points: pointsEarned + (settings.welcome_bonus_points || 0),
            redeemed_points: 0,
            tier: 'bronze',
          });
      }

      // Log transaction
      await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          order_id: orderId,
          points: pointsEarned,
          transaction_type: 'earn',
          description: `Earned ${pointsEarned} points on order`,
        });

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

      // Get user's current points
      const { data: userPoints } = await supabase
        .from('user_loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!userPoints || (userPoints.available_points || 0) < points) {
        throw new Error('Insufficient points');
      }

      // Get settings for value calculation
      const { data: settings } = await supabase
        .from('loyalty_settings')
        .select('points_value_per_rupee')
        .limit(1)
        .single();

      const discountValue = Math.floor(points * (settings?.points_value_per_rupee || 0.25));

      // Update points
      await supabase
        .from('user_loyalty_points')
        .update({
          available_points: (userPoints.available_points || 0) - points,
          redeemed_points: userPoints.redeemed_points + points,
        })
        .eq('user_id', user.id);

      // Log transaction
      await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          order_id: orderId || null,
          points: -points,
          transaction_type: 'redeem',
          description: `Redeemed ${points} points for ₹${discountValue} discount`,
        });

      return { points, discountValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-loyalty-points'] });
    },
  });
};
