
-- 1. Fix: Replace overly permissive public SELECT policy on product_reviews
-- The current "Public can view product reviews" policy has USING(true), exposing unapproved reviews
DROP POLICY IF EXISTS "Public can view product reviews" ON public.product_reviews;

CREATE POLICY "Public can view approved reviews"
ON public.product_reviews
FOR SELECT
TO anon, authenticated
USING (is_approved = true);

-- 2. Add newsletter rate limiting via RPC (reusing contact_rate_limits pattern)
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit(
  _identifier text,
  max_attempts integer DEFAULT 3,
  window_minutes integer DEFAULT 10
)
RETURNS TABLE(allowed boolean, attempts_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  -- Clean old entries
  DELETE FROM contact_rate_limits
  WHERE identifier LIKE 'newsletter:%'
    AND attempt_time < NOW() - (window_minutes || ' minutes')::INTERVAL;

  -- Count recent attempts
  SELECT COUNT(*) INTO recent_attempts
  FROM contact_rate_limits
  WHERE identifier = _identifier
    AND attempt_time > NOW() - (window_minutes || ' minutes')::INTERVAL;

  IF recent_attempts < max_attempts THEN
    INSERT INTO contact_rate_limits (identifier)
    VALUES (_identifier);
    RETURN QUERY SELECT TRUE, (max_attempts - recent_attempts - 1)::INTEGER;
  ELSE
    RETURN QUERY SELECT FALSE, 0::INTEGER;
  END IF;
END;
$$;
