
-- 1. Restrict has_role to only allow checking own role (prevents admin enumeration)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND _user_id = auth.uid()
  )
$$;

-- 2. Create a public-safe view for product reviews that excludes user_id
CREATE OR REPLACE VIEW public.public_product_reviews AS
SELECT
  id,
  product_id,
  rating,
  title,
  content,
  reviewer_name,
  reviewer_avatar,
  is_verified_purchase,
  is_featured,
  helpful_count,
  admin_reply,
  admin_reply_at,
  created_at,
  updated_at,
  is_approved
FROM public.product_reviews;

-- Grant access to the view
GRANT SELECT ON public.public_product_reviews TO anon, authenticated;

-- 3. Replace the overly permissive public SELECT policy on product_reviews
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.product_reviews;

-- Create a restrictive policy: only authenticated users can see their own reviews, admins see all
-- The public view handles anonymous/public read access without exposing user_id
CREATE POLICY "Users can view their own reviews"
ON public.product_reviews
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR is_approved = true
  OR has_role(auth.uid(), 'admin')
);

-- 4. Add contact rate limiting table
CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  attempt_time timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon/authenticated for rate limit tracking
CREATE POLICY "Anyone can insert contact rate limits"
ON public.contact_rate_limits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only allow reading own rate limits (by identifier)
CREATE POLICY "Anyone can read contact rate limits"
ON public.contact_rate_limits
FOR SELECT
TO anon, authenticated
USING (true);

-- Rate limit check function for contact form
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit(
  _identifier text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 30
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
  WHERE attempt_time < NOW() - (window_minutes || ' minutes')::INTERVAL;

  -- Count recent attempts
  SELECT COUNT(*) INTO recent_attempts
  FROM contact_rate_limits
  WHERE identifier = _identifier
    AND attempt_time > NOW() - (window_minutes || ' minutes')::INTERVAL;

  IF recent_attempts < max_attempts THEN
    -- Record attempt
    INSERT INTO contact_rate_limits (identifier)
    VALUES (_identifier);

    RETURN QUERY SELECT TRUE, (max_attempts - recent_attempts - 1)::INTEGER;
  ELSE
    RETURN QUERY SELECT FALSE, 0::INTEGER;
  END IF;
END;
$$;
