import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: 'Festive Season Sale',
    subtitle: 'Up to 30% Off',
    description: 'Celebrate with silver. Limited time offers on select pieces.',
    image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=600&fit=crop',
    cta: 'Shop Now',
    link: '/shop?tag=sale',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Fresh from the Atelier',
    description: 'Discover our latest creations, straight from our master craftsmen.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=400&fit=crop',
    cta: 'Explore New',
    link: '/shop?tag=new',
  },
  {
    id: 3,
    title: 'Gift Sets',
    subtitle: 'Perfect Presents',
    description: 'Curated gift sets for every occasion. Make moments memorable.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=400&fit=crop',
    cta: 'View Gifts',
    link: '/shop?category=gifts',
  },
];

const PromoBanners = () => {
  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Main large banner */}
          <Link
            to={banners[0].link}
            className="group relative overflow-hidden rounded-xl aspect-[4/3] md:row-span-2"
          >
            <img
              src={banners[0].image}
              alt={banners[0].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-accent/70 via-accent/50 to-transparent" />
            
            <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-center">
              <p className="font-accent text-xs text-background/90 tracking-widest uppercase mb-1">
                {banners[0].subtitle}
              </p>
              <h3 className="font-display text-2xl md:text-3xl text-background mb-2">
                {banners[0].title}
              </h3>
              <p className="font-body text-background/80 mb-4 max-w-xs text-sm">
                {banners[0].description}
              </p>
              <div>
                <Button
                  variant="glass"
                  size="default"
                  className="text-background border-background/30 hover:bg-background/20"
                >
                  {banners[0].cta}
                </Button>
              </div>
            </div>
          </Link>

          {/* Two smaller banners stacked */}
          {banners.slice(1).map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="group relative overflow-hidden rounded-xl aspect-[16/9]"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className={`absolute inset-0 ${
                banner.id === 2 
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
                    {banner.cta}
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