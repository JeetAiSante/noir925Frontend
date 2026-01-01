-- Fix search_path for the loyalty function
CREATE OR REPLACE FUNCTION enforce_single_loyalty_setting()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM loyalty_settings) >= 1 AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Only one loyalty_settings row is allowed';
  END IF;
  RETURN NEW;
END;
$$;