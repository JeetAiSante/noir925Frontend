import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoShowcase = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
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
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-foreground">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-accent tracking-widest uppercase mb-2">
            Behind The Craft
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-background mb-4">
            The Art of Silver Making
          </h2>
          <p className="font-body text-lg text-background/70 max-w-2xl mx-auto">
            Watch our master artisans transform raw silver into timeless pieces of art
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden group">
          {/* Video */}
          <div className="aspect-video bg-muted/10">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&h=1080&fit=crop"
              muted={isMuted}
              loop
              playsInline
              preload="none"
              onTimeUpdate={handleTimeUpdate}
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-craftsman-making-jewelry-5220-large.mp4"
                type="video/mp4"
              />
            </video>

            {/* Play Button Overlay */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}
            >
              <button
                onClick={togglePlay}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center hover:bg-background/30 transition-all duration-300 hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 md:w-10 md:h-10 text-background" />
                ) : (
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-background ml-1" />
                )}
              </button>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Progress Bar */}
              <div className="w-full h-1 bg-background/20 rounded-full mb-4 cursor-pointer">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="text-background hover:bg-background/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-background hover:bg-background/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </div>
                <span className="font-body text-sm text-background/80">
                  The Journey of Pure Silver
                </span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-accent/50 rounded-tl-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-accent/50 rounded-br-2xl pointer-events-none" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          {[
            { value: '50+', label: 'Years of Legacy' },
            { value: '10K+', label: 'Happy Customers' },
            { value: '500+', label: 'Unique Designs' },
            { value: '100%', label: 'Hallmarked Silver' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-display text-3xl md:text-4xl text-accent mb-2">{stat.value}</p>
              <p className="font-body text-sm text-background/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
