import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OptimizedImage from '@/components/ui/optimized-image';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  button_text: string | null;
  link: string | null;
  start_date: string | null;
  end_date: string | null;
}

// Fallback banners if no DB banners
const fallbackBanners = [
  {
    id: '1',
    title: 'Festive Season Sale',
    subtitle: 'Up to 30% Off',
    description: 'Celebrate with silver. Limited time offers on select pieces.',
    image_url: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=600&fit=crop',
    button_text: 'Shop Now',
    link: '/shop?tag=sale',
  },
  {
    id: '2',
    title: 'New Arrivals',
    subtitle: 'Fresh from the Atelier',
    description: 'Discover our latest creations, straight from our master craftsmen.',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=400&fit=crop',
    button_text: 'Explore New',
    link: '/shop?tag=new',
  },
  {
    id: '3',
    title: 'Gift Sets',
    subtitle: 'Perfect Presents',
    description: 'Curated gift sets for every occasion. Make moments memorable.',
    image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=400&fit=crop',
    button_text: 'View Gifts',
    link: '/shop?category=gifts',
  },
];

const PromoBanners = () => {
  const { data: banners = [] } = useQuery({
    queryKey: ['promo-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, subtitle, description, image_url, button_text, link, start_date, end_date')
        .eq('position', 'promo')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(3);

      if (error) throw error;
      
      // Filter by date scheduling
      const now = new Date();
      const validBanners = (data || []).filter((banner: Banner) => {
        const startOk = !banner.start_date || new Date(banner.start_date) <= now;
        const endOk = !banner.end_date || new Date(banner.end_date) >= now;
        return startOk && endOk;
      });
      
      return validBanners.length > 0 ? validBanners : fallbackBanners;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const displayBanners = banners.length > 0 ? banners : fallbackBanners;

  return (
    <section className="py-10 md:py-14 bg-muted/30" aria-label="Promotional offers">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Main large banner */}
          {displayBanners[0] && (
            <Link
              to={displayBanners[0].link || '/shop'}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] md:row-span-2"
              aria-label={displayBanners[0].title}
            >
              <OptimizedImage
                src={displayBanners[0].image_url}
                alt={displayBanners[0].title}
                aspectRatio="auto"
                priority={false}
                blurPlaceholder={true}
                className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-accent/70 via-accent/50 to-transparent" />
              
              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-center">
                <p className="font-accent text-xs text-background/90 tracking-widest uppercase mb-1">
                  {displayBanners[0].subtitle}
                </p>
                <h3 className="font-display text-2xl md:text-3xl text-background mb-2">
                  {displayBanners[0].title}
                </h3>
                <p className="font-body text-background/80 mb-4 max-w-xs text-sm">
                  {displayBanners[0].description}
                </p>
                <div>
                  <Button
                    variant="glass"
                    size="default"
                    className="text-background border-background/30 hover:bg-background/20"
                  >
                    {displayBanners[0].button_text || 'Shop Now'}
                  </Button>
                </div>
              </div>
            </Link>
          )}

          {/* Two smaller banners stacked */}
          {displayBanners.slice(1, 3).map((banner, index) => (
            <Link
              key={banner.id}
              to={banner.link || '/shop'}
              className="group relative overflow-hidden rounded-xl aspect-[16/9]"
              aria-label={banner.title}
            >
              <OptimizedImage
                src={banner.image_url}
                alt={banner.title}
                aspectRatio="video"
                priority={false}
                blurPlaceholder={true}
                className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className={`absolute inset-0 ${
                index === 0 
                  ? 'bg-gradient-to-r from-primary/70 via-primary/50 to-transparent' 
                  : 'bg-gradient-to-r from-secondary/70 via-secondary/50 to-transparent'
              }`} />
              
              <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-center">
                <p className="font-accent text-[10px] text-background/90 tracking-widest uppercase mb-0.5">
                  {banner.subtitle}
                </p>
                <h3 className="font-display text-lg md:text-xl text-background mb-1">
                  {banner.title}
                </h3>
                <p className="font-body text-background/80 mb-3 max-w-[200px] text-xs line-clamp-2">
                  {banner.description}
                </p>
                <div>
                  <Button
                    variant="glass"
                    size="sm"
                    className="text-background border-background/30 hover:bg-background/20"
                  >
                    {banner.button_text || 'Shop Now'}
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
