import { useState } from 'react';
import { ExternalLink, Heart } from 'lucide-react';

const InstagramFeed = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const posts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      likes: 234,
      caption: 'Celestial dreams ✨ #NOIR925 #SilverJewellery',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      likes: 189,
      caption: 'Blooming elegance 🌸 #FloralCollection',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
      likes: 312,
      caption: 'Forever & always 💕 #BridalHeritage',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      likes: 267,
      caption: 'Statement pieces 🖤 #925Sterling',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      likes: 198,
      caption: 'Timeless classics ✨ #VintageVibes',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop',
      likes: 423,
      caption: 'Delicate details 🦋 #NatureInspired',
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
      likes: 156,
      caption: 'Lotus love 🪷 #SilverCraft',
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=400&h=400&fit=crop',
      likes: 289,
      caption: 'Bold & beautiful 🐍 #StatementRings',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
            Follow Us
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            @NOIR925_Official
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Join our community of silver lovers. Tag us to get featured!
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              data-cursor="card"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className={`absolute inset-0 bg-foreground/60 flex flex-col items-center justify-center transition-opacity duration-300 ${
                hoveredIndex === index ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="flex items-center gap-4 text-background mb-2">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-body">{post.likes}</span>
                  </div>
                  <ExternalLink className="w-5 h-5" />
                </div>
                <p className="font-body text-sm text-background/80 text-center px-4 line-clamp-2">
                  {post.caption}
                </p>
              </div>

              {/* Shimmer effect */}
              {hoveredIndex === index && (
                <div className="absolute inset-0 shimmer pointer-events-none" />
              )}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-primary hover:text-primary/80 transition-colors"
          >
            Follow @NOIR925_Official
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
