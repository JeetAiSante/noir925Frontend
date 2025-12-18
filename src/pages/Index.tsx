import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import TrustStrip from '@/components/home/TrustStrip';
import CategoriesCarousel from '@/components/home/CategoriesCarousel';
import BestsellersGrid from '@/components/home/BestsellersGrid';
import TrendingSlider from '@/components/home/TrendingSlider';
import CollectionsStory from '@/components/home/CollectionsStory';
import PromoBanners from '@/components/home/PromoBanners';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import SilverCareSection from '@/components/home/SilverCareSection';
import InstagramFeed from '@/components/home/InstagramFeed';
import ReviewsSection from '@/components/home/ReviewsSection';
import FinalCTA from '@/components/home/FinalCTA';
import RecentlyViewed from '@/components/home/RecentlyViewed';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section - Full-screen with video-like background */}
        <HeroSection />
        
        {/* Trust Strip - Immediately visible utility badges */}
        <TrustStrip />
        
        {/* Categories Carousel */}
        <CategoriesCarousel />
        
        {/* Bestseller Products Grid */}
        <BestsellersGrid />
        
        {/* Trending Now - 3D Slider */}
        <TrendingSlider />
        
        {/* Promo Banners Stack */}
        <PromoBanners />
        
        {/* Collections Story Blocks */}
        <CollectionsStory />
        
        {/* Shop by Occasion */}
        <ShopByOccasion />
        
        {/* Silver Care & Education */}
        <SilverCareSection />
        
        {/* Instagram / Lookbook Feed */}
        <InstagramFeed />
        
        {/* Reviews & Social Proof */}
        <ReviewsSection />
        
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
