import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const GiftOfChoiceSection = memo(() => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-muted/20" aria-label="Gift of Choice">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="inline-block px-4 py-1.5 text-xs md:text-sm font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
            Exclusive Gifting
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-3">
            Find The Perfect Piece
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            To Celebrate Life's Special Moments
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <Link to="/gifting" className="block group">
            <div className="relative rounded-xl overflow-hidden bg-[#f8f0f2] shadow-lg hover:shadow-2xl transition-shadow duration-500">
              {/* Ribbon vertical */}
              <div className="absolute left-6 md:left-10 top-0 bottom-0 w-3 md:w-4 bg-[#8B2B4D] z-10" />
              
              {/* Ribbon horizontal */}
              <div className="absolute left-0 right-0 bottom-12 md:bottom-16 h-3 md:h-4 bg-[#8B2B4D] z-10" />
              
              {/* Ribbon knot */}
              <div className="absolute left-3 md:left-7 bottom-9 md:bottom-13 z-20">
                <div className="relative w-10 h-10 md:w-14 md:h-14">
                  {/* Center circle */}
                  <div className="absolute inset-0 m-auto w-5 h-5 md:w-7 md:h-7 rounded-full bg-[#8B2B4D]" />
                  {/* Petals */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-5 md:w-5 md:h-6 rounded-full bg-[#8B2B4D] -translate-y-1/2" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 md:w-5 md:h-6 rounded-full bg-[#8B2B4D] translate-y-1/2" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-4 md:w-6 md:h-5 rounded-full bg-[#8B2B4D] -translate-x-1/2" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-4 md:w-6 md:h-5 rounded-full bg-[#8B2B4D] translate-x-1/2" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-0 px-8 py-10 md:px-14 md:py-16 pl-14 md:pl-20">
                <motion.h3 
                  className="font-display text-3xl md:text-4xl lg:text-5xl text-[#8B2B4D] mb-3 md:mb-4"
                  style={{ fontStyle: 'italic' }}
                >
                  #GiftOfChoice
                </motion.h3>
                <p className="text-muted-foreground text-sm md:text-base mb-1">
                  Breathtaking gifts for your loved one's
                </p>
                <p className="text-[#8B2B4D] font-semibold text-sm md:text-base tracking-wide mb-6 md:mb-8">
                  STARTING AT ₹10,000
                </p>
                
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 border-2 border-foreground/80 rounded-full text-foreground font-medium text-sm md:text-base group-hover:bg-foreground group-hover:text-background transition-all duration-300"
                  whileHover={{ x: 5 }}
                >
                  Explore Now
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            </div>
          </Link>
        </motion.div>

        {/* SEO-friendly additional content */}
        <div className="sr-only">
          <h3>Premium Silver Gift Collections</h3>
          <p>
            Discover NOIR925's exclusive gift collection featuring handcrafted 925 sterling silver 
            jewellery perfect for weddings, anniversaries, birthdays, and special occasions. 
            Our curated gift selection includes elegant rings, necklaces, bracelets, and earrings 
            starting at ₹10,000. Each piece comes in premium gift packaging with free gift wrapping.
          </p>
        </div>
      </div>
    </section>
  );
});

GiftOfChoiceSection.displayName = 'GiftOfChoiceSection';

export default GiftOfChoiceSection;
