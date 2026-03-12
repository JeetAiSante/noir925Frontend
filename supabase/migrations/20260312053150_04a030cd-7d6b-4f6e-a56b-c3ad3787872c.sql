-- Remove the INSERT policy that allows users to self-assign arbitrary loyalty points
DROP POLICY IF EXISTS "System can insert points" ON public.user_loyalty_points;