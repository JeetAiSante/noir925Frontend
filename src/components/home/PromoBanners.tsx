import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PromoBanners = () => {
  const banners = [
    {
      id: 1,
      title: 'Festive Season Sale',
      subtitle: 'Up to 30% Off',
      description: 'Celebrate with silver. Limited time offers on select pieces.',
      image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&h=400&fit=crop',
      cta: 'Shop Now',
      link: '/shop?tag=sale',
      gradient: 'from-accent/80 to-accent/40',
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Fresh from the Atelier',
      description: 'Discover our latest creations, straight from our master craftsmen.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=400&fit=crop',
      cta: 'Explore New',
      link: '/shop?tag=new',
      gradient: 'from-primary/80 to-primary/40',
    },
    {
      id: 3,
      title: 'Gift Sets',
      subtitle: 'Perfect Presents',
      description: 'Curated gift sets for every occasion. Make moments memorable.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=400&fit=crop',
      cta: 'View Gifts',
      link: '/shop?category=gifts',
      gradient: 'from-secondary/80 to-secondary/40',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <Link
              key={banner.id}
              to={banner.link}
              className={`group relative overflow-hidden rounded-2xl ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              } ${index === 0 ? 'aspect-[2/1] md:aspect-auto md:h-full' : 'aspect-[16/9]'}`}
              data-cursor="card"
            >
              {/* Background */}
              <div className="absolute inset-0">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
              </div>

              {/* Content */}
              <div className="relative h-full p-6 md:p-8 flex flex-col justify-center">
                <p className="font-accent text-sm text-background/90 tracking-widest uppercase mb-1">
                  {banner.subtitle}
                </p>
                <h3 className={`font-display text-background mb-2 ${
                  index === 0 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                }`}>
                  {banner.title}
                </h3>
                <p className={`font-body text-background/80 mb-4 ${
                  index === 0 ? 'max-w-md' : 'max-w-xs text-sm'
                }`}>
                  {banner.description}
                </p>
                <div>
                  <Button
                    variant="glass"
                    size={index === 0 ? 'lg' : 'default'}
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
