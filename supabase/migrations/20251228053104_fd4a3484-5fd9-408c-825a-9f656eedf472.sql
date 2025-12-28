-- Create atomic function for coupon usage increment with limit check
CREATE OR REPLACE FUNCTION public.atomic_use_coupon(coupon_code_input TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  discount_value NUMERIC,
  discount_type TEXT,
  min_order_value NUMERIC,
  max_discount_amount NUMERIC,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  coupon_row RECORD;
BEGIN
  -- Try atomic update with limit check
  UPDATE coupons c
  SET usage_count = COALESCE(c.usage_count, 0) + 1
  WHERE c.code = coupon_code_input
    AND c.is_active = true
    AND (c.usage_limit IS NULL OR COALESCE(c.usage_count, 0) < c.usage_limit)
    AND (c.start_date IS NULL OR c.start_date <= NOW())
    AND (c.end_date IS NULL OR c.end_date >= NOW())
  RETURNING c.* INTO coupon_row;
  
  IF coupon_row IS NULL THEN
    -- Check if coupon exists but is exhausted
    SELECT c.* INTO coupon_row FROM coupons c WHERE c.code = coupon_code_input;
    
    IF coupon_row IS NULL THEN
      RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, 
        NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon not found'::TEXT;
    ELSIF NOT coupon_row.is_active THEN
      RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, 
        NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon is not active'::TEXT;
    ELSIF coupon_row.usage_limit IS NOT NULL AND COALESCE(coupon_row.usage_count, 0) >= coupon_row.usage_limit THEN
      RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, 
        NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon has reached its usage limit'::TEXT;
    ELSE
      RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::TEXT, 
        NULL::NUMERIC, NULL::NUMERIC, FALSE, 'Coupon is expired or not yet valid'::TEXT;
    END IF;
  ELSE
    RETURN QUERY SELECT 
      coupon_row.id, coupon_row.code, coupon_row.discount_value, coupon_row.discount_type,
      coupon_row.min_order_value, coupon_row.max_discount_amount, TRUE, NULL::TEXT;
  END IF;
END;
$$;

-- Create atomic function for stock decrement with availability check
CREATE OR REPLACE FUNCTION public.atomic_decrement_stock(product_id_input UUID, quantity_input INTEGER)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  remaining_stock INTEGER,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  product_row RECORD;
BEGIN
  -- Try atomic update with stock check
  UPDATE products p
  SET stock_quantity = p.stock_quantity - quantity_input
  WHERE p.id = product_id_input
    AND p.is_active = true
    AND p.stock_quantity >= quantity_input
  RETURNING p.id, p.name, p.stock_quantity INTO product_row;
  
  IF product_row IS NULL THEN
    -- Check if product exists but has insufficient stock
    SELECT p.id, p.name, p.stock_quantity INTO product_row FROM products p WHERE p.id = product_id_input;
    
    IF product_row IS NULL THEN
      RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::INTEGER, FALSE, 'Product not found'::TEXT;
    ELSIF product_row.stock_quantity < quantity_input THEN
      RETURN QUERY SELECT 
        product_row.id, product_row.name, product_row.stock_quantity::INTEGER, FALSE, 
        ('Only ' || product_row.stock_quantity || ' units available')::TEXT;
    ELSE
      RETURN QUERY SELECT 
        NULL::UUID, NULL::TEXT, NULL::INTEGER, FALSE, 'Product is not available'::TEXT;
    END IF;
  ELSE
    RETURN QUERY SELECT 
      product_row.id, product_row.name, product_row.stock_quantity::INTEGER, TRUE, NULL::TEXT;
  END IF;
END;
$$;

-- Create atomic function to rollback stock if order fails (for compensation)
CREATE OR REPLACE FUNCTION public.atomic_rollback_stock(product_id_input UUID, quantity_input INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE products p
  SET stock_quantity = p.stock_quantity + quantity_input
  WHERE p.id = product_id_input;
END;
$$;

-- Create atomic function to rollback coupon usage if order fails
CREATE OR REPLACE FUNCTION public.atomic_rollback_coupon(coupon_code_input TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE coupons c
  SET usage_count = GREATEST(COALESCE(c.usage_count, 0) - 1, 0)
  WHERE c.code = coupon_code_input;
END;
$$;