import { useRef, useEffect, useState } from 'react';

const VideoShowcase = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {});
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-foreground">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <p className="font-accent text-xs md:text-sm text-accent tracking-widest uppercase mb-2">
            Behind The Craft
          </p>
          <h2 className="font-display text-2xl md:text-4xl text-background mb-3">
            The Art of Silver Making
          </h2>
          <p className="font-body text-sm md:text-base text-background/70 max-w-xl mx-auto">
            Watch our master artisans transform raw silver into timeless pieces of art
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden">
          <div className="aspect-video bg-muted/10">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&h=1080&fit=crop"
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-accent/50 rounded-tl-xl pointer-events-none hidden md:block" />
          <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-accent/50 rounded-br-xl pointer-events-none hidden md:block" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-3xl mx-auto">
          {[
            { value: '50+', label: 'Years of Legacy' },
            { value: '10K+', label: 'Happy Customers' },
            { value: '500+', label: 'Unique Designs' },
            { value: '100%', label: 'Hallmarked Silver' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-accent mb-1">{stat.value}</p>
              <p className="font-body text-xs md:text-sm text-background/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;