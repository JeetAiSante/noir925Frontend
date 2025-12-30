-- Add feature toggle for location dropdown
INSERT INTO feature_toggles (feature_key, feature_name, description, is_enabled)
VALUES ('location_dropdown', 'Location Dropdown', 'Show/hide the location dropdown in header', true)
ON CONFLICT (feature_key) DO NOTHING;

-- Add feature toggle for header categories
INSERT INTO feature_toggles (feature_key, feature_name, description, is_enabled)
VALUES ('header_categories', 'Header Categories', 'Show dynamic categories in header navigation', true)
ON CONFLICT (feature_key) DO NOTHING;

-- Add show_in_header column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_header boolean DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS header_sort_order integer DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS header_icon text;

-- Add layout settings for grid columns
INSERT INTO site_settings (key, value, category, description)
VALUES ('grid_columns_settings', '{"desktop": 4, "tablet": 3, "mobile": 2}', 'display', 'Grid columns for product displays')
ON CONFLICT (key) DO NOTHING;

-- Create review_images table for storing user review images
CREATE TABLE IF NOT EXISTS review_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on review_images
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for review_images
CREATE POLICY "Public can view review images"
ON review_images FOR SELECT
USING (true);

CREATE POLICY "Users can add images to their reviews"
ON review_images FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM product_reviews
    WHERE product_reviews.id = review_images.review_id
    AND product_reviews.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage review images"
ON review_images FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add reply functionality to reviews
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS admin_reply text;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS admin_reply_at timestamp with time zone;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS order_id uuid;

-- Add page content for about page if not exists
INSERT INTO page_content (page_key, page_title, content, meta_title, meta_description)
VALUES (
  'about',
  'About Us',
  '{
    "hero": {
      "title": "The Art of Silver Craftsmanship",
      "subtitle": "Where tradition meets innovation",
      "backgroundImage": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80"
    },
    "story": {
      "title": "Born from a Love of Silver & Soul",
      "paragraphs": [
        "NOIR925 was born from a simple belief: that fine jewelry should be accessible to everyone.",
        "Today, we bring together traditional craftsmanship and modern design to create pieces that are both timeless and contemporary."
      ],
      "image": "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
    },
    "stats": [
      {"value": "50+", "label": "Master Artisans", "description": "Skilled craftspeople"},
      {"value": "100K+", "label": "Happy Customers", "description": "Worldwide"},
      {"value": "500+", "label": "Unique Designs", "description": "In our collection"},
      {"value": "14+", "label": "Years", "description": "Of excellence"}
    ],
    "values": [
      {"icon": "Gem", "title": "Craftsmanship", "description": "Each piece is meticulously handcrafted by skilled artisans."},
      {"icon": "Heart", "title": "Passion", "description": "We pour our heart into every design."},
      {"icon": "Shield", "title": "Quality", "description": "Only the finest 925 sterling silver."},
      {"icon": "Sparkles", "title": "Innovation", "description": "Blending traditional techniques with contemporary design."}
    ],
    "milestones": [
      {"year": "2010", "event": "Founded in Jaipur, India"},
      {"year": "2014", "event": "Launched flagship store"},
      {"year": "2020", "event": "100,000+ happy customers"},
      {"year": "2024", "event": "Launched heritage bridal collection"}
    ]
  }',
  'About NOIR925 | Our Story, Craftsmanship & Heritage',
  'Discover NOIR925 journey from Jaipur jewelry capital. Handcrafted 925 sterling silver jewelry.'
)
ON CONFLICT (page_key) DO NOTHING;