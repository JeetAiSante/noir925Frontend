-- Add styling columns to countdown_timers table for full customization
ALTER TABLE public.countdown_timers
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#1a472a',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#c9a962',
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Shop Sale',
ADD COLUMN IF NOT EXISTS icon_type TEXT DEFAULT 'percent';

-- Add comment for documentation
COMMENT ON COLUMN public.countdown_timers.bg_color IS 'Background color in hex format';
COMMENT ON COLUMN public.countdown_timers.text_color IS 'Text color in hex format';
COMMENT ON COLUMN public.countdown_timers.accent_color IS 'Accent/highlight color in hex format';
COMMENT ON COLUMN public.countdown_timers.button_text IS 'Call-to-action button text';
COMMENT ON COLUMN public.countdown_timers.icon_type IS 'Icon type: percent, gift, zap, star';