import { useState, useEffect } from 'react';
import { ExternalLink, Heart, Instagram, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InstagramPost {
  id: string;
  image: string;
  likes: number;
  caption: string;
  permalink: string;
}

const fallbackPosts: InstagramPost[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
    likes: 234,
    caption: 'Celestial dreams ✨ #NOIR925',
    permalink: 'https://instagram.com/noir925_official',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    likes: 189,
    caption: 'Blooming elegance 🌸',
    permalink: 'https://instagram.com/noir925_official',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    likes: 312,
    caption: 'Forever & always 💕',
    permalink: 'https://instagram.com/noir925_official',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    likes: 267,
    caption: 'Statement pieces 🖤',
    permalink: 'https://instagram.com/noir925_official',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    likes: 198,
    caption: 'Timeless classics ✨',
    permalink: 'https://instagram.com/noir925_official',
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop',
    likes: 423,
    caption: 'Delicate details 🦋',
    permalink: 'https://instagram.com/noir925_official',
  },
];

const InstagramFeed = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>(fallbackPosts);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-instagram');
        
        if (error) {
          console.log('Using fallback posts - edge function error:', error);
          setPosts(fallbackPosts);
          return;
        }

        if (data?.success && data?.posts?.length > 0) {
          setPosts(data.posts);
          setIsLive(true);
        } else {
          // Use fallback posts from API or local
          setPosts(data?.posts || fallbackPosts);
        }
      } catch (error) {
        console.log('Using fallback posts:', error);
        setPosts(fallbackPosts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstagramPosts();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <Instagram className="w-5 h-5 text-primary" />
            <p className="font-accent text-xs md:text-sm text-primary tracking-widest uppercase">
              Follow Us
            </p>
            {isLive && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-600 text-[10px] rounded-full font-medium">
                LIVE
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl md:text-4xl text-foreground mb-2">
            @NOIR925_Official
          </h2>
          <p className="font-body text-sm md:text-base text-muted-foreground">
            Join our community of silver lovers
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Instagram Grid */}
        {!isLoading && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {posts.map((post, index) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg md:rounded-xl"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className={`absolute inset-0 bg-foreground/70 flex flex-col items-center justify-center transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="flex items-center gap-2 text-background mb-1">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-body text-sm">{post.likes}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-background/80" />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-6">
          <a
            href="https://instagram.com/noir925_official"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Follow @NOIR925_Official
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;