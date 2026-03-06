-- Fix spin_wheel_history: Remove insecure session_id SELECT policy and replace with secure one
DROP POLICY IF EXISTS "Users can view their own spin history" ON public.spin_wheel_history;
CREATE POLICY "Users can view their own spin history"
ON public.spin_wheel_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix spin_wheel_history: Restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can insert spin history" ON public.spin_wheel_history;
CREATE POLICY "Authenticated users can insert spin history"
ON public.spin_wheel_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix newsletter_subscribers: Add email validation to INSERT policy
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) <= 320 AND
  email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
);

-- Fix contact_messages: Add input validation to INSERT policy
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) <= 100 AND
  length(email) <= 320 AND
  length(message) <= 5000 AND
  (subject IS NULL OR length(subject) <= 200) AND
  email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
);