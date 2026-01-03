-- Create homepage_reels table for managing video reels
CREATE TABLE public.homepage_reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  linked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  linked_product_name TEXT,
  linked_product_image TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_reels ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Anyone can view active reels" 
ON public.homepage_reels 
FOR SELECT 
USING (is_active = true);

-- Admin full access policy
CREATE POLICY "Admins can manage reels" 
ON public.homepage_reels 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_homepage_reels_updated_at
BEFORE UPDATE ON public.homepage_reels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample reels data
INSERT INTO public.homepage_reels (title, subtitle, video_url, thumbnail_url, sort_order) VALUES
('Every Hour is Diamond Hour', 'From business hours to blissful evenings, make every moment shine...', 'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-silver-jewelry-43946-large.mp4', 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=600&fit=crop', 1),
('Sunday Brunch', 'Elegant pieces for your special moments', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=600&fit=crop', 2),
('Evening Elegance', 'Statement silver for evening occasions', 'https://assets.mixkit.co/videos/preview/mixkit-woman-taking-photos-with-a-silver-jewelry-43945-large.mp4', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=600&fit=crop', 3),
('Office Ready', 'Minimalist designs for professional style', 'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-silver-jewelry-43946-large.mp4', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=600&fit=crop', 4),
('Weekend Vibes', 'Casual elegance for relaxed days', 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=600&fit=crop', 5);