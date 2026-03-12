
-- 1. Drop the user-facing INSERT policy on loyalty_transactions
DROP POLICY IF EXISTS "System can insert transactions" ON public.loyalty_transactions;

-- 2. Drop the user-facing INSERT policy on spin_wheel_history
DROP POLICY IF EXISTS "Authenticated users can insert spin history" ON public.spin_wheel_history;

-- 3. Update earn_loyalty_points RPC to also log the transaction
CREATE OR REPLACE FUNCTION public.earn_loyalty_points(_user_id uuid, _points_earned integer, _welcome_bonus integer DEFAULT 0)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  IF _points_earned <= 0 THEN
    RETURN FALSE;
  END IF;

  -- Try to update existing record
  UPDATE user_loyalty_points
  SET total_points = total_points + _points_earned,
      available_points = COALESCE(available_points, 0) + _points_earned
  WHERE user_id = _user_id;

  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO user_loyalty_points (user_id, total_points, available_points, redeemed_points, tier)
    VALUES (_user_id, _points_earned + _welcome_bonus, _points_earned + _welcome_bonus, 0, 'bronze');
  END IF;

  -- Log the earn transaction server-side
  INSERT INTO loyalty_transactions (user_id, points, transaction_type, description)
  VALUES (_user_id, _points_earned, 'earn', 'Earned ' || _points_earned || ' points on order');

  RETURN TRUE;
END;
$$;

-- 4. Update redeem_loyalty_points RPC to also log the transaction
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(_user_id uuid, _points_to_redeem integer)
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

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Log the redeem transaction server-side
  INSERT INTO loyalty_transactions (user_id, points, transaction_type, description)
  VALUES (_user_id, -_points_to_redeem, 'redeem', 'Redeemed ' || _points_to_redeem || ' points');

  RETURN TRUE;
END;
$$;
