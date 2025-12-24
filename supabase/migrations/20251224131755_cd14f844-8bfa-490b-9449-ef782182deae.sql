-- Create storage buckets for products and banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('banner-images', 'banner-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Storage policies for banner images
CREATE POLICY "Public can view banner images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

CREATE POLICY "Admins can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banner-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update banner images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banner-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete banner images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banner-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create product_reviews table for the reviews component
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_reviews
CREATE POLICY "Public can view product reviews"
ON public.product_reviews FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product reviews"
ON public.product_reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create reviews"
ON public.product_reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for updated_at on product_reviews
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample reviews for display
INSERT INTO public.product_reviews (reviewer_name, reviewer_avatar, rating, title, content, is_verified_purchase, is_featured)
VALUES 
  ('Priya Sharma', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 5, 'Absolutely Stunning!', 'The craftsmanship is exceptional. Every detail is perfect. Received so many compliments on my new necklace!', true, true),
  ('Ananya Patel', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 5, 'Perfect for Wedding', 'Bought this for my wedding and it was the highlight of my jewelry. Pure silver and beautiful design.', true, true),
  ('Meera Reddy', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', 5, 'Worth Every Penny', 'High quality 925 silver that doesn''t tarnish. Will definitely buy again from NOIR925!', true, true),
  ('Kavya Nair', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop', 4, 'Beautiful Earrings', 'The earrings are lightweight and comfortable. Perfect for everyday wear. Love the minimalist design.', true, true),
  ('Divya Menon', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop', 5, 'Exceeded Expectations', 'Packaging was premium and the bracelet even more beautiful in person. Fast delivery too!', true, true),
  ('Sneha Gupta', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop', 5, 'Gift for Mom', 'Gifted this to my mom on her birthday. She absolutely loved it! The quality speaks for itself.', true, true),
  ('Riya Singh', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', 5, 'Elegant & Timeless', 'This pendant is now my everyday piece. So elegant and goes with everything!', true, true),
  ('Aishwarya Kumar', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop', 4, 'Great Quality', 'Impressed by the quality at this price point. The ring fits perfectly and looks gorgeous.', true, true);