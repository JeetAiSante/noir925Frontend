-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Create spin_wheel_history table
CREATE TABLE public.spin_wheel_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  prize_type TEXT NOT NULL,
  prize_value TEXT NOT NULL,
  coupon_code TEXT,
  is_redeemed BOOLEAN DEFAULT false,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spin_wheel_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for spin_wheel_history
CREATE POLICY "Users can view their own spin history"
ON public.spin_wheel_history
FOR SELECT
USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Anyone can insert spin history"
ON public.spin_wheel_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all spin history"
ON public.spin_wheel_history
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Users can update their own spin history"
ON public.spin_wheel_history
FOR UPDATE
USING (auth.uid() = user_id);