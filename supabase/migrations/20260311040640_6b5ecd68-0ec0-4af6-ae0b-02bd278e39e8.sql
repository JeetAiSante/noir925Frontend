
-- Create a security definer function for earning loyalty points (since UPDATE policy was dropped)
CREATE OR REPLACE FUNCTION public.earn_loyalty_points(
  _user_id uuid,
  _points_earned integer,
  _welcome_bonus integer DEFAULT 0
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

  RETURN TRUE;
END;
$$;
