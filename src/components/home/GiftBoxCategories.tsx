import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Package, Box, Sparkles } from 'lucide-react';

const giftBoxes = [
  {
    id: 1,
    title: 'Wooden Gift Box',
    subtitle: 'Premium Finish',
    description: 'Elegant wooden boxes with velvet lining',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    price: '₹299',
    icon: Box,
    color: 'from-amber-600 to-orange-700',
    tag: 'Most Popular',
  },
  {
    id: 2,
    title: 'Velvet Pouch Set',
    subtitle: 'Pack of 5',
    description: 'Soft velvet pouches for delicate pieces',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop',
    price: '₹149',
    icon: Gift,
    color: 'from-purple-600 to-violet-700',
    tag: 'Value Pack',
  },
  {
    id: 3,
    title: 'Luxury Gift Set',
    subtitle: 'Complete Package',
    description: 'Box, pouch, ribbon & greeting card',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop',
    price: '₹499',
    icon: Package,
    color: 'from-primary to-accent',
    tag: 'Best for Gifting',
  },
  {
    id: 4,
    title: 'Bulk Pack',
    subtitle: '10+ Boxes',
    description: 'Wholesale pricing for retailers',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    price: '₹1,999',
    icon: Box,
    color: 'from-teal-600 to-emerald-700',
    tag: 'Business',
  },
];

const GiftBoxCategories = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Perfect Presentation</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            Gift <span className="text-primary">Packaging</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Make your gift extra special with our premium packaging options
          </p>
        </motion.div>

        {/* Gift Box Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {giftBoxes.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link to="/shop?category=gift-boxes" className="block">
                <div className="relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl">
                  {/* Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${box.color}`}>
                      {box.tag}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={box.image}
                      alt={box.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                    
                    {/* Icon Overlay */}
                    <motion.div 
                      className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <box.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                          {box.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{box.subtitle}</p>
                      </div>
                      <span className="font-display text-lg font-semibold text-primary">
                        {box.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {box.description}
                    </p>
                  </div>

                  {/* Hover Sparkle */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Sparkles className="w-8 h-8 text-accent/50" />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bulk Order CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border border-border/50">
            <Package className="w-10 h-10 text-primary" />
            <div className="text-left">
              <h4 className="font-display text-lg text-foreground">Need Bulk Packaging?</h4>
              <p className="text-sm text-muted-foreground">Contact us for wholesale pricing on 50+ boxes</p>
            </div>
            <Link 
              to="/contact"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Get Quote
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GiftBoxCategories;
