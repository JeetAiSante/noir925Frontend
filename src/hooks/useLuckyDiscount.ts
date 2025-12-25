import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface LuckyDiscount {
  id: string;
  name: string;
  description: string | null;
  lucky_numbers: number[];
  login_time_start: string | null;
  login_time_end: string | null;
  discount_percent: number;
  discount_code: string | null;
  min_order_value: number;
  max_discount_amount: number | null;
}

interface LuckyDiscountResult {
  isEligible: boolean;
  discount: LuckyDiscount | null;
  luckyNumber: number | null;
  message: string;
}

export const useLuckyDiscount = () => {
  const { user } = useAuth();
  const [loginTime] = useState(() => new Date());

  const { data: activeDiscounts = [] } = useQuery({
    queryKey: ['active-lucky-discounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lucky_number_discounts')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as LuckyDiscount[];
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const checkEligibility = (): LuckyDiscountResult => {
    if (!user || activeDiscounts.length === 0) {
      return { isEligible: false, discount: null, luckyNumber: null, message: '' };
    }

    const currentTime = loginTime.toTimeString().slice(0, 8); // HH:MM:SS format
    const currentMinute = loginTime.getMinutes();
    const currentSecond = loginTime.getSeconds();

    // Generate a lucky number based on login time (minute + second)
    const generatedLuckyNumber = currentMinute + currentSecond;

    for (const discount of activeDiscounts) {
      // Check time window
      if (discount.login_time_start && discount.login_time_end) {
        if (currentTime < discount.login_time_start || currentTime > discount.login_time_end) {
          continue;
        }
      }

      // Check if generated number matches any lucky number
      const matchedNumber = discount.lucky_numbers.find(
        (num) => num === generatedLuckyNumber || 
                 num === currentMinute || 
                 String(generatedLuckyNumber).includes(String(num)) ||
                 generatedLuckyNumber % num === 0
      );

      if (matchedNumber) {
        return {
          isEligible: true,
          discount,
          luckyNumber: matchedNumber,
          message: `🎉 Lucky you! Your login time generated lucky number ${generatedLuckyNumber}. You've won ${discount.discount_percent}% off!`,
        };
      }
    }

    return {
      isEligible: false,
      discount: null,
      luckyNumber: generatedLuckyNumber,
      message: `Your lucky number is ${generatedLuckyNumber}. Keep trying for special discounts!`,
    };
  };

  const claimDiscount = async (discountId: string, luckyNumber: number) => {
    if (!user) return null;

    const discount = activeDiscounts.find(d => d.id === discountId);
    if (!discount) return null;

    const { data, error } = await supabase
      .from('lucky_discount_claims')
      .insert({
        user_id: user.id,
        discount_id: discountId,
        lucky_number: luckyNumber,
        login_time: loginTime.toTimeString().slice(0, 8),
        discount_code: discount.discount_code || `LUCKY${luckyNumber}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single();

    if (error) {
      console.error('Error claiming discount:', error);
      return null;
    }

    return data;
  };

  return {
    checkEligibility,
    claimDiscount,
    activeDiscounts,
    loginTime,
  };
};
