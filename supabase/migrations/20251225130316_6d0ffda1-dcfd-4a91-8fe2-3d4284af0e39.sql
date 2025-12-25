-- Create table for lucky number discount rules
CREATE TABLE public.lucky_number_discounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lucky_numbers INTEGER[] NOT NULL DEFAULT '{}',
  login_time_start TIME,
  login_time_end TIME,
  discount_percent INTEGER NOT NULL DEFAULT 10,
  discount_code TEXT,
  min_order_value NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track which users received lucky discounts
CREATE TABLE public.lucky_discount_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  discount_id UUID REFERENCES public.lucky_number_discounts(id) ON DELETE CASCADE,
  lucky_number INTEGER NOT NULL,
  login_time TIME NOT NULL,
  discount_code TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lucky_number_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lucky_discount_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lucky_number_discounts
CREATE POLICY "Admins can manage lucky discounts" 
ON public.lucky_number_discounts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read active lucky discounts" 
ON public.lucky_number_discounts 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for lucky_discount_claims
CREATE POLICY "Admins can view all claims" 
ON public.lucky_discount_claims 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own claims" 
ON public.lucky_discount_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims" 
ON public.lucky_discount_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" 
ON public.lucky_discount_claims 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_lucky_number_discounts_updated_at
BEFORE UPDATE ON public.lucky_number_discounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample lucky discount rules
INSERT INTO public.lucky_number_discounts (name, description, lucky_numbers, login_time_start, login_time_end, discount_percent, discount_code, is_active)
VALUES 
  ('Morning Lucky 7', 'Login between 7-8 AM with lucky number 7', ARRAY[7, 77], '07:00:00', '08:00:00', 15, 'LUCKY7AM', true),
  ('Midnight Special', 'Login at midnight hour for special discount', ARRAY[12, 24], '00:00:00', '01:00:00', 20, 'MIDNIGHT20', true),
  ('Lucky 11:11', 'Login at 11 AM with lucky number 11', ARRAY[11, 111], '11:00:00', '11:30:00', 11, 'LUCKY1111', true);