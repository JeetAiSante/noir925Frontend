import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronRight, Gift, Sparkles, Heart, Star } from 'lucide-react';

const GiftOfChoiceSection = memo(() => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);
  
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 3,
  }));

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" aria-label="Gift of Choice">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-background to-amber-50/50 dark:from-rose-950/20 dark:via-background dark:to-amber-950/20" />
      
      {/* Floating sparkles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute text-primary/20"
            initial={{ 
              x: `${particle.x}%`, 
              y: '100%',
              opacity: 0,
              rotate: 0
            }}
            animate={{ 
              y: '-20%',
              opacity: [0, 0.6, 0],
              rotate: 360
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" style={{ width: particle.size, height: particle.size }} />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 mb-5"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(139, 43, 77, 0.1)',
                '0 0 40px rgba(139, 43, 77, 0.2)',
                '0 0 20px rgba(139, 43, 77, 0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium tracking-wider uppercase text-primary">Exclusive Gifting Experience</span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-4">
            Find The <span className="text-primary italic">Perfect</span> Piece
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
            To Celebrate Life's Most Precious Moments
          </p>
        </motion.div>

        {/* 3D Gift Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="max-w-lg mx-auto perspective-1000"
          style={{ perspective: 1000 }}
        >
          <Link to="/gifting" className="block">
            <motion.div
              className="relative group cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Card glow effect */}
              <motion.div 
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-rose-400/30 via-primary/20 to-amber-400/30 blur-2xl"
                animate={{
                  opacity: isHovered ? 0.8 : 0.4,
                  scale: isHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.4 }}
              />

              {/* Main card */}
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[#fef7f8] via-[#fff5f7] to-[#fdf2f4] dark:from-[#2a1a1d] dark:via-[#251518] dark:to-[#201214] shadow-2xl border border-rose-200/50 dark:border-rose-800/30"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Decorative corner ribbons */}
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 overflow-hidden">
                  <motion.div 
                    className="absolute top-3 -right-10 w-36 md:w-44 bg-gradient-to-r from-[#8B2B4D] to-[#6b1f3a] text-white text-xs font-semibold py-1.5 text-center rotate-45 shadow-lg"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    ✨ Premium
                  </motion.div>
                </div>

                {/* Vertical ribbon with 3D effect */}
                <motion.div 
                  className="absolute left-6 md:left-10 top-0 bottom-0 w-4 md:w-5"
                  style={{ 
                    background: 'linear-gradient(90deg, #6b1f3a 0%, #8B2B4D 50%, #6b1f3a 100%)',
                    boxShadow: '2px 0 10px rgba(139, 43, 77, 0.3)',
                    transform: 'translateZ(10px)'
                  }}
                />
                
                {/* Horizontal ribbon */}
                <motion.div 
                  className="absolute left-0 right-0 bottom-16 md:bottom-20 h-4 md:h-5"
                  style={{ 
                    background: 'linear-gradient(180deg, #6b1f3a 0%, #8B2B4D 50%, #6b1f3a 100%)',
                    boxShadow: '0 2px 10px rgba(139, 43, 77, 0.3)',
                    transform: 'translateZ(10px)'
                  }}
                />
                
                {/* 3D Ribbon bow/knot */}
                <motion.div 
                  className="absolute left-3 md:left-6 bottom-12 md:bottom-16 z-20"
                  animate={{ 
                    rotate: isHovered ? [0, -5, 5, 0] : 0,
                    scale: isHovered ? 1.1 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <div className="relative w-14 h-14 md:w-20 md:h-20">
                    {/* Bow petals with gradients */}
                    <motion.div 
                      className="absolute w-7 h-9 md:w-10 md:h-12 rounded-full left-0 top-1/2 -translate-y-1/2"
                      style={{ 
                        background: 'linear-gradient(135deg, #a13558 0%, #8B2B4D 50%, #6b1f3a 100%)',
                        transformOrigin: 'right center',
                        transform: 'rotate(-30deg) translateZ(5px)'
                      }}
                    />
                    <motion.div 
                      className="absolute w-7 h-9 md:w-10 md:h-12 rounded-full right-0 top-1/2 -translate-y-1/2"
                      style={{ 
                        background: 'linear-gradient(-135deg, #a13558 0%, #8B2B4D 50%, #6b1f3a 100%)',
                        transformOrigin: 'left center',
                        transform: 'rotate(30deg) translateZ(5px)'
                      }}
                    />
                    <motion.div 
                      className="absolute w-7 h-9 md:w-10 md:h-12 rounded-full left-1/2 -translate-x-1/2 top-0"
                      style={{ 
                        background: 'linear-gradient(to bottom, #a13558 0%, #8B2B4D 50%, #6b1f3a 100%)',
                        transformOrigin: 'bottom center',
                        transform: 'rotate(-15deg) translateZ(8px)'
                      }}
                    />
                    <motion.div 
                      className="absolute w-7 h-9 md:w-10 md:h-12 rounded-full left-1/2 -translate-x-1/2 bottom-0"
                      style={{ 
                        background: 'linear-gradient(to top, #a13558 0%, #8B2B4D 50%, #6b1f3a 100%)',
                        transformOrigin: 'top center',
                        transform: 'rotate(15deg) translateZ(8px)'
                      }}
                    />
                    {/* Center knot */}
                    <motion.div 
                      className="absolute inset-0 m-auto w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#a13558] via-[#8B2B4D] to-[#5a1830] shadow-lg"
                      style={{ transform: 'translateZ(15px)' }}
                      animate={{ 
                        boxShadow: [
                          '0 4px 20px rgba(139, 43, 77, 0.4)',
                          '0 4px 30px rgba(139, 43, 77, 0.6)',
                          '0 4px 20px rgba(139, 43, 77, 0.4)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                {/* Content area */}
                <div className="relative z-0 px-8 py-12 md:px-16 md:py-20 pl-16 md:pl-24">
                  {/* Floating decorative elements */}
                  <motion.div 
                    className="absolute top-6 right-6 text-primary/20"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 15, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Heart className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-16 right-16 text-amber-400/30"
                    animate={{ 
                      y: [0, 8, 0],
                      rotate: [0, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Star className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                  </motion.div>

                  {/* Main title with gradient */}
                  <motion.h3 
                    className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-5 bg-gradient-to-r from-[#8B2B4D] via-[#a13558] to-[#8B2B4D] bg-clip-text text-transparent"
                    style={{ 
                      fontStyle: 'italic',
                      transform: 'translateZ(30px)'
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    #GiftOfChoice
                  </motion.h3>
                  
                  <motion.p 
                    className="text-muted-foreground text-sm md:text-base mb-2"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    Breathtaking gifts for your loved one's
                  </motion.p>
                  
                  <motion.p 
                    className="text-[#8B2B4D] font-bold text-base md:text-lg tracking-wide mb-8 md:mb-10"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    STARTING AT <span className="text-xl md:text-2xl">₹10,000</span>
                  </motion.p>
                  
                  {/* CTA Button with 3D effect */}
                  <motion.div
                    className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-foreground to-foreground/90 text-background rounded-full font-medium text-sm md:text-base shadow-xl"
                    style={{ transform: 'translateZ(40px)' }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Now
                    <motion.div
                      animate={{ x: isHovered ? 5 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Shimmer overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  initial={{ x: '-100%' }}
                  animate={{ x: isHovered ? '100%' : '-100%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 mt-10 md:mt-14"
        >
          {[
            { icon: Gift, label: 'Premium Packaging' },
            { icon: Heart, label: 'Gift Wrapping' },
            { icon: Sparkles, label: 'Personal Message' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm"
              whileHover={{ scale: 1.05, color: 'var(--primary)' }}
            >
              <item.icon className="w-4 h-4 text-primary" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* SEO content */}
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
