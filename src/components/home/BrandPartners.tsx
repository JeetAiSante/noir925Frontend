import { useEffect, useRef, useState } from 'react';

const partners = [
  { name: 'Vogue India', logo: 'V' },
  { name: 'Elle India', logo: 'E' },
  { name: 'Femina', logo: 'F' },
  { name: 'Grazia', logo: 'G' },
  { name: 'Brides Today', logo: 'B' },
  { name: 'Harper\'s Bazaar', logo: 'H' },
];

const BrandPartners = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovered) return;

    const animate = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 mb-8">
        <p className="font-accent text-sm text-center text-muted-foreground tracking-widest uppercase">
          As Featured In
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex animate-marquee">
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-12 md:px-16 flex items-center justify-center group cursor-pointer"
            >
              <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300">
                <span className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center font-display text-2xl text-foreground/70 group-hover:text-primary transition-colors">
                  {partner.logo}
                </span>
                <span className="font-display text-lg text-foreground/70 group-hover:text-foreground transition-colors whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPartners;
