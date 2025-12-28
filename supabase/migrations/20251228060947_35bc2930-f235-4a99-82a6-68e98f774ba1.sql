-- Add tracking_number column to orders table
ALTER TABLE public.orders 
ADD COLUMN tracking_number text;

-- Add tracking_url column for carrier tracking links
ALTER TABLE public.orders 
ADD COLUMN tracking_url text;

-- Add carrier column to store shipping carrier name
ALTER TABLE public.orders 
ADD COLUMN carrier text;