
-- 1. Remove public SELECT on lucky_number_discounts (codes are exposed)
DROP POLICY IF EXISTS "Public can read active lucky discounts" ON public.lucky_number_discounts;

-- 2. Remove public SELECT on spin_wheel_prizes (coupon codes exposed via value column)
DROP POLICY IF EXISTS "Public can read active prizes" ON public.spin_wheel_prizes;

-- 3. Create a secure RPC that returns prize display data WITHOUT coupon codes
CREATE OR REPLACE FUNCTION public.get_spin_wheel_display_prizes()
RETURNS TABLE(id uuid, label text, color text, discount_percent integer, weight integer, sort_order integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.label, p.color, p.discount_percent, p.weight, p.sort_order
  FROM spin_wheel_prizes p
  WHERE p.is_active = true
  ORDER BY p.sort_order;
$$;

-- 4. Create a secure RPC to perform the spin and return the prize code server-side
CREATE OR REPLACE FUNCTION public.perform_spin(_user_id uuid)
RETURNS TABLE(prize_label text, prize_value text, prize_type text, coupon_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _settings RECORD;
  _spin_count integer;
  _total_weight integer;
  _random numeric;
  _cumulative integer := 0;
  _winner RECORD;
BEGIN
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check settings
  SELECT * INTO _settings FROM spin_wheel_settings LIMIT 1;
  IF _settings IS NULL OR NOT _settings.is_enabled THEN
    RAISE EXCEPTION 'Spin wheel is disabled';
  END IF;

  -- Check daily spin limit
  SELECT COUNT(*) INTO _spin_count
  FROM spin_wheel_history
  WHERE user_id = _user_id
    AND created_at >= CURRENT_DATE;

  IF _spin_count >= _settings.spins_per_day THEN
    RAISE EXCEPTION 'Daily spin limit reached';
  END IF;

  -- Weighted random selection
  SELECT SUM(weight) INTO _total_weight FROM spin_wheel_prizes WHERE is_active = true;
  _random := random() * _total_weight;

  FOR _winner IN SELECT * FROM spin_wheel_prizes WHERE is_active = true ORDER BY sort_order LOOP
    _cumulative := _cumulative + _winner.weight;
    IF _random <= _cumulative THEN
      -- Record spin
      INSERT INTO spin_wheel_history (user_id, prize_type, prize_value, coupon_code, is_redeemed)
      VALUES (
        _user_id,
        CASE WHEN _winner.value != '' AND _winner.value IS NOT NULL THEN 'discount' ELSE 'try_again' END,
        _winner.label,
        CASE WHEN _winner.value != '' AND _winner.value IS NOT NULL THEN _winner.value ELSE NULL END,
        false
      );

      RETURN QUERY SELECT
        _winner.label,
        _winner.value,
        CASE WHEN _winner.value != '' AND _winner.value IS NOT NULL THEN 'discount' ELSE 'try_again' END,
        CASE WHEN _winner.value != '' AND _winner.value IS NOT NULL THEN _winner.value ELSE NULL END;
      RETURN;
    END IF;
  END LOOP;
END;
$$;
