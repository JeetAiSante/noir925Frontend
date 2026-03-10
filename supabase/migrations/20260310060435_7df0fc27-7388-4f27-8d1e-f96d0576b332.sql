
-- 1. Fix user_loyalty_points: Replace open UPDATE with security definer function
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_loyalty_points;

CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(
  _user_id uuid,
  _points_to_redeem integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  IF _points_to_redeem <= 0 THEN
    RAISE EXCEPTION 'Points must be positive';
  END IF;

  UPDATE user_loyalty_points
  SET redeemed_points = redeemed_points + _points_to_redeem,
      available_points = total_points - (redeemed_points + _points_to_redeem)
  WHERE user_id = _user_id
    AND (total_points - redeemed_points) >= _points_to_redeem;

  RETURN FOUND;
END;
$$;

-- 2. Fix coupons: Remove public read access (atomic_use_coupon handles validation)
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;

-- 3. Fix spin_wheel_history UPDATE: Only allow marking as redeemed via function
DROP POLICY IF EXISTS "Users can update their own spin history" ON public.spin_wheel_history;

CREATE OR REPLACE FUNCTION public.redeem_spin_prize(_spin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE spin_wheel_history
  SET is_redeemed = true, redeemed_at = NOW()
  WHERE id = _spin_id
    AND user_id = auth.uid()
    AND is_redeemed = false;
  RETURN FOUND;
END;
$$;

-- 4. Fix lucky_discount_claims UPDATE: Only allow marking as used via function
DROP POLICY IF EXISTS "Users can update their own claims" ON public.lucky_discount_claims;

CREATE OR REPLACE FUNCTION public.use_lucky_discount_claim(_claim_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE lucky_discount_claims
  SET is_used = true, used_at = NOW()
  WHERE id = _claim_id
    AND user_id = auth.uid()
    AND is_used = false
    AND (expires_at IS NULL OR expires_at > NOW());
  RETURN FOUND;
END;
$$;

-- 5. Fix inventory_settings: Remove public read (admin only)
DROP POLICY IF EXISTS "Public can read inventory settings" ON public.inventory_settings;

-- 6. Fix product_reviews INSERT: Ensure user_id matches auth.uid()
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'product_reviews' AND cmd = 'INSERT' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.product_reviews', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can create reviews with own user_id"
ON public.product_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));
