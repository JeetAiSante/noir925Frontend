import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoHeroSection from '@/components/home/VideoHeroSection';
import TrustStrip from '@/components/home/TrustStrip';
import CountdownBanner from '@/components/home/CountdownBanner';
import CategoriesCarousel from '@/components/home/CategoriesCarousel';
import BestsellersGrid from '@/components/home/BestsellersGrid';
import NewArrivalsGrid from '@/components/home/NewArrivalsGrid';
import TrendingSlider from '@/components/home/TrendingSlider';
import ParallaxBanner from '@/components/home/ParallaxBanner';
import VideoShowcase from '@/components/home/VideoShowcase';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import CollectionsStory from '@/components/home/CollectionsStory';
import PromoBanners from '@/components/home/PromoBanners';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import SilverCareSection from '@/components/home/SilverCareSection';
import BrandPartners from '@/components/home/BrandPartners';
import PremiumReviewsSection from '@/components/home/PremiumReviewsSection';
import InstagramFeed from '@/components/home/InstagramFeed';
import NewsletterSection from '@/components/home/NewsletterSection';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import FinalCTA from '@/components/home/FinalCTA';
import { OrganizationSchema, WebsiteSchema, FAQSchema } from '@/components/seo/ProductSchema';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO Structured Data */}
      <OrganizationSchema />
      <WebsiteSchema />
      <FAQSchema />
      
      <Header />
      
      <main>
        {/* Hero Section - Full-screen with video background */}
        <VideoHeroSection />
        
        {/* Countdown Sale Banner */}
        <CountdownBanner />
        
        {/* Trust Strip - Immediately visible utility badges */}
        <TrustStrip />
        
        {/* Categories Carousel */}
        <CategoriesCarousel />
        
        {/* Bestseller Products Grid */}
        <BestsellersGrid />
        
        {/* Parallax Promotional Banners */}
        <ParallaxBanner />
        
        {/* New Arrivals with Animations */}
        <NewArrivalsGrid />
        
        {/* Trending Now - 3D Slider */}
        <TrendingSlider />
        
        {/* Video Showcase - Craftsmanship */}
        <VideoShowcase />
        
        {/* Featured Categories Grid */}
        <FeaturedCategories />
        
        {/* Promo Banners Stack */}
        <PromoBanners />
        
        {/* Collections Story Blocks */}
        <CollectionsStory />
        
        {/* Shop by Occasion */}
        <ShopByOccasion />
        
        {/* Silver Care & Education */}
        <SilverCareSection />
        
        {/* Brand Partners / As Featured In */}
        <BrandPartners />
        
        {/* Customer Reviews Carousel */}
        <PremiumReviewsSection />
        
        {/* Instagram / Lookbook Feed */}
        <InstagramFeed />
        
        {/* Newsletter Signup */}
        <NewsletterSection />
        
        {/* Recently Viewed Products */}
        <RecentlyViewed />
        
        {/* Final Conversion CTA */}
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;