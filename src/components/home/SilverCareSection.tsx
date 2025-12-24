import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Video, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SilverCareSection = () => {
  const guides = [
    {
      icon: Sparkles,
      title: 'Cleaning Your Silver',
      description: 'Learn the gentle art of keeping your silver jewellery sparkling like new.',
      link: '/silver-care#cleaning',
    },
    {
      icon: BookOpen,
      title: 'Storage Tips',
      description: 'Proper storage techniques to prevent tarnishing and preserve shine.',
      link: '/silver-care#storage',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides from our master craftsmen.',
      link: '/silver-care#videos',
    },
    {
      icon: HelpCircle,
      title: 'FAQs',
      description: 'Common questions about silver care and maintenance answered.',
      link: '/faq',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&h=600&fit=crop"
                alt="Silver care"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-6 bg-background p-6 rounded-xl shadow-luxury max-w-[200px]">
              <p className="font-display text-3xl text-primary mb-1">25+</p>
              <p className="font-body text-sm text-muted-foreground">Years of expertise in silver craftsmanship</p>
            </div>

            {/* Decorative element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-primary/20 rounded-full" />
          </div>

          {/* Content Side */}
          <div>
            <p className="font-accent text-sm text-primary tracking-widest uppercase mb-2">
              Expert Guidance
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
              Silver Care & Education
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-8">
              Your silver jewellery deserves the best care. Discover our comprehensive guides 
              to keep your pieces radiant for generations.
            </p>

            {/* Guide Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {guides.map((guide) => (
                <Link
                  key={guide.title}
                  to={guide.link}
                  className="group p-4 bg-background rounded-xl hover:shadow-soft transition-all duration-300"
                  data-cursor="card"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <guide.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {guide.description}
                  </p>
                </Link>
              ))}
            </div>

            <Link to="/silver-care">
              <Button variant="luxury-outline" size="lg">
                Explore All Guides
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SilverCareSection;
