
-- Create a read-only coupon validation function (no usage_count increment)
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code_input text)
RETURNS TABLE(id uuid, code text, discount_value numeric, discount_type text, min_order_value numeric, max_discount_amount numeric, success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coupon_row RECORD;
BEGIN
  SELECT c.* INTO coupon_row FROM coupons c WHERE c.code = coupon_code_input;
  
  IF coupon_row IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon not found'::TEXT;
    RETURN;
  END IF;
  
  IF NOT coupon_row.is_active THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon is not active'::TEXT;
    RETURN;
  END IF;
  
  IF coupon_row.usage_limit IS NOT NULL AND COALESCE(coupon_row.usage_count, 0) >= coupon_row.usage_limit THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon has reached its usage limit'::TEXT;
    RETURN;
  END IF;
  
  IF coupon_row.start_date IS NOT NULL AND coupon_row.start_date > NOW() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon is not yet valid'::TEXT;
    RETURN;
  END IF;
  
  IF coupon_row.end_date IS NOT NULL AND coupon_row.end_date < NOW() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon has expired'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT coupon_row.id, coupon_row.code, coupon_row.discount_value, coupon_row.discount_type, coupon_row.min_order_value, coupon_row.max_discount_amount, TRUE, NULL::TEXT;
END;
$$;
