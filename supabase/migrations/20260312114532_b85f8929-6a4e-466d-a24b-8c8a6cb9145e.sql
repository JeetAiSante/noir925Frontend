
-- Fix: Set view to SECURITY INVOKER (safe for public reads)
ALTER VIEW public.public_product_reviews SET (security_invoker = on);

-- Fix: Tighten the contact_rate_limits INSERT policy to prevent abuse
DROP POLICY IF EXISTS "Anyone can insert contact rate limits" ON public.contact_rate_limits;
DROP POLICY IF EXISTS "Anyone can read contact rate limits" ON public.contact_rate_limits;

-- Rate limiting is handled entirely through the check_contact_rate_limit RPC (SECURITY DEFINER)
-- No direct table access needed for anon/authenticated users
