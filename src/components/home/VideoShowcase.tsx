import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const VideoShowcase = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);

  // Fetch video URL from settings
  const { data: videoUrl } = useQuery({
    queryKey: ['homepage-video-url'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_video_url')
        .single();
      
      if (error || !data) {
        return 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4';
      }
      
      // Parse the JSON value
      const url = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      return url || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4';
    },
  });

  // Intersection Observer for auto-play
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        } else if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section ref={sectionRef} className="py-12 md:py-20 bg-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium tracking-wider uppercase mb-3">
            Behind The Craft
          </span>
          <h2 className="font-display text-2xl md:text-4xl lg:text-5xl text-background mb-3">
            The Art of <span className="text-accent">Silver</span> Making
          </h2>
          <p className="font-body text-sm md:text-base text-background/60 max-w-xl mx-auto">
            Watch our master artisans transform raw silver into timeless pieces of art
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-5xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-background/50">
          <div className="aspect-video bg-muted/10 relative group">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&h=1080&fit=crop"
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              autoPlay
            >
              {videoUrl && <source src={videoUrl} type="video/mp4" />}
            </video>

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center hover:bg-background/30 transition-colors">
                {isPlaying ? (
                  <Pause className="w-6 h-6 md:w-8 md:h-8 text-background" />
                ) : (
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-background ml-1" />
                )}
              </div>
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/20 backdrop-blur-md flex items-center justify-center hover:bg-background/30 transition-all opacity-0 group-hover:opacity-100"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-background" />
              ) : (
                <Volume2 className="w-4 h-4 text-background" />
              )}
            </button>

            {/* Live Badge */}
            {isPlaying && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-accent/90 backdrop-blur-sm rounded-full">
                <span className="w-2 h-2 bg-background rounded-full animate-pulse" />
                <span className="text-xs font-medium text-accent-foreground">Playing</span>
              </div>
            )}
          </div>

          {/* Decorative frame */}
          <div className="absolute -top-2 -left-2 w-16 h-16 border-t-2 border-l-2 border-accent/40 rounded-tl-3xl pointer-events-none hidden md:block" />
          <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-2 border-r-2 border-accent/40 rounded-br-3xl pointer-events-none hidden md:block" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            { value: '50+', label: 'Years of Legacy' },
            { value: '10K+', label: 'Happy Customers' },
            { value: '500+', label: 'Unique Designs' },
            { value: '100%', label: 'Hallmarked Silver' },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <p className="font-display text-3xl md:text-4xl text-accent mb-1 group-hover:scale-110 transition-transform">
                {stat.value}
              </p>
              <p className="font-body text-xs md:text-sm text-background/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;