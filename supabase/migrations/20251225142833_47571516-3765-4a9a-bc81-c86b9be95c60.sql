-- Create sold_products table for tracking sold out products
CREATE TABLE public.sold_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  sold_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  remove_after TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  is_removed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sold_products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage sold products" 
ON public.sold_products 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read sold products" 
ON public.sold_products 
FOR SELECT 
USING (true);

-- Add video_url column to banners for video support
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add is_video column to distinguish video banners
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT false;