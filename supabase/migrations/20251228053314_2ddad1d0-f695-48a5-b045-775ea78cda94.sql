-- Create rate limiting table for checkout attempts
CREATE TABLE public.checkout_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_hint TEXT -- Optional identifier for additional tracking
);

-- Create index for efficient queries
CREATE INDEX idx_checkout_rate_limits_user_time ON public.checkout_rate_limits (user_id, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.checkout_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own rate limit records
CREATE POLICY "Users can insert their own rate limits"
ON public.checkout_rate_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own rate limits (for debugging)
CREATE POLICY "Users can view their own rate limits"
ON public.checkout_rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to check and record checkout attempt atomically
CREATE OR REPLACE FUNCTION public.check_checkout_rate_limit(
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS TABLE (
  allowed BOOLEAN,
  attempts_remaining INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  recent_attempts INTEGER;
  oldest_attempt TIMESTAMP WITH TIME ZONE;
  seconds_until_reset INTEGER;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0;
    RETURN;
  END IF;
  
  -- Count recent attempts within the time window
  SELECT COUNT(*), MIN(attempt_time)
  INTO recent_attempts, oldest_attempt
  FROM checkout_rate_limits
  WHERE user_id = current_user_id
    AND attempt_time > NOW() - (window_minutes || ' minutes')::INTERVAL;
  
  -- If under limit, record the attempt and allow
  IF recent_attempts < max_attempts THEN
    INSERT INTO checkout_rate_limits (user_id)
    VALUES (current_user_id);
    
    RETURN QUERY SELECT 
      TRUE, 
      (max_attempts - recent_attempts - 1)::INTEGER,
      0;
  ELSE
    -- Calculate seconds until oldest attempt expires
    seconds_until_reset := GREATEST(0, 
      EXTRACT(EPOCH FROM (oldest_attempt + (window_minutes || ' minutes')::INTERVAL - NOW()))::INTEGER
    );
    
    RETURN QUERY SELECT 
      FALSE, 
      0::INTEGER,
      seconds_until_reset;
  END IF;
END;
$$;

-- Create cleanup function for old rate limit records (to be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM checkout_rate_limits
  WHERE attempt_time < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;