import { useEffect, useRef, useState } from 'react';

const partners = [
  { name: 'Vogue India', logo: 'V' },
  { name: 'Elle India', logo: 'E' },
  { name: 'Femina', logo: 'F' },
  { name: 'Grazia', logo: 'G' },
  { name: 'Brides Today', logo: 'B' },
  { name: 'Harper\'s Bazaar', logo: 'H' },
  { name: 'Cosmopolitan', logo: 'C' },
  { name: 'Marie Claire', logo: 'M' },
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
        scrollContainer.scrollLeft += 0.5;
      }
    };

    const interval = setInterval(animate, 20);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="py-10 md:py-12 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 mb-6">
        <p className="font-accent text-xs md:text-sm text-center text-muted-foreground tracking-widest uppercase">
          As Featured In
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex">
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-6 md:px-10 flex items-center justify-center group cursor-pointer"
            >
              <div className="flex items-center gap-2 md:gap-3 opacity-40 hover:opacity-100 transition-opacity duration-300">
                <span className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-foreground/5 flex items-center justify-center font-display text-lg md:text-xl text-foreground/70 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                  {partner.logo}
                </span>
                <span className="font-display text-sm md:text-base text-foreground/70 group-hover:text-foreground transition-colors whitespace-nowrap">
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