import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";
import { Award, Heart, Gem, Users, Sparkles, Shield } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Gem,
      title: "Craftsmanship",
      description: "Each piece is meticulously handcrafted by skilled artisans with decades of experience.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "We pour our heart into every design, creating jewelry that tells your story.",
    },
    {
      icon: Shield,
      title: "Quality",
      description: "Only the finest 925 sterling silver and ethically sourced materials.",
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Blending traditional techniques with contemporary design aesthetics.",
    },
  ];

  const milestones = [
    { year: "2010", event: "Founded in Jaipur with a vision to redefine silver jewelry" },
    { year: "2014", event: "Launched our flagship store and online presence" },
    { year: "2017", event: "Expanded to 10+ cities across India" },
    { year: "2020", event: "Achieved 100,000+ happy customers milestone" },
    { year: "2023", event: "Introduced sustainable packaging and eco-friendly practices" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-display mb-6">Our Story</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Crafting timeless elegance in silver since 2010
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-display mb-6">The Art of Silver</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Quendera was born from a simple belief: that fine jewelry should be accessible 
                to everyone. Our journey began in the historic city of Jaipur, India's jewelry 
                capital, where generations of skilled artisans have perfected the art of 
                silversmithing.
              </p>
              <p>
                Today, we bring together traditional craftsmanship and modern design to create 
                pieces that are both timeless and contemporary. Each piece in our collection 
                tells a story – of heritage, of artistry, and of the hands that shaped it.
              </p>
              <p>
                We believe that jewelry is more than adornment. It's a form of self-expression, 
                a celebration of life's moments, and a connection to the ones we love.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
              alt="Artisan crafting jewelry"
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-lg">
              <p className="text-3xl font-display">14+</p>
              <p className="text-sm">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* Values Section */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-display text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-card border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-lg">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-display mb-6">Meet the Team</h2>
          <p className="text-muted-foreground mb-8">
            Behind every piece of Quendera jewelry is a team of passionate individuals – 
            from our master artisans in Jaipur to our designers, customer service specialists, 
            and everyone in between. Together, we're committed to bringing you the finest 
            silver jewelry experience.
          </p>
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-display text-primary">50+</p>
              <p className="text-sm text-muted-foreground">Artisans</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-3xl font-display text-primary">100K+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-3xl font-display text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Unique Designs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-display mb-4">Award-Winning Excellence</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Recognized for our commitment to quality and design, Quendera has been honored 
            with multiple industry awards for craftsmanship, innovation, and customer service.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
