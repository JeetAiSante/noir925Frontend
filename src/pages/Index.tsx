import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LuxuryHeroSection from '@/components/home/LuxuryHeroSection';
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
import WeddingCollectionShowcase from '@/components/home/WeddingCollectionShowcase';
import LuxuryEditorialSection from '@/components/home/LuxuryEditorialSection';
import SeasonalBanner from '@/components/home/SeasonalBanner';
import BrandStorySection from '@/components/home/BrandStorySection';
import RandomReviewsCarousel from '@/components/home/RandomReviewsCarousel';
import DailywearSection from '@/components/home/DailywearSection';
import FestivalBanner from '@/components/home/FestivalBanner';
import FirstTimePopup from '@/components/popups/FirstTimePopup';
import PriceBasedProducts from '@/components/home/PriceBasedProducts';
import GiftBoxCategories from '@/components/home/GiftBoxCategories';
import GenderShopSection from '@/components/home/GenderShopSection';
import { OrganizationSchema, WebsiteSchema, FAQSchema } from '@/components/seo/ProductSchema';

const Index = () => {
  return (
    <FirstTimePopup>
      <div className="min-h-screen bg-background">
        <OrganizationSchema />
        <WebsiteSchema />
        <FAQSchema />
        
        <Header />
        
        <main className="overflow-hidden">
          {/* Luxury Hero Section - with video support */}
          <LuxuryHeroSection />
          
          {/* Countdown Sale Banner */}
          <CountdownBanner />
          
          {/* Festival Theme Banner - Dynamic */}
          <FestivalBanner />
          
          {/* Trust Strip - Single instance */}
          <TrustStrip />
          
          {/* Categories Carousel */}
          <CategoriesCarousel />
          
          {/* Bestsellers */}
          <BestsellersGrid />
          
          {/* Price Based Products */}
          <PriceBasedProducts />
          
          {/* Him/Her Gender Section */}
          <GenderShopSection />
          
          {/* Wedding Collection */}
          <WeddingCollectionShowcase />
          
          {/* Gift Box Categories */}
          <GiftBoxCategories />
          
          {/* Parallax Banner */}
          <ParallaxBanner />
          
          {/* New Arrivals */}
          <NewArrivalsGrid />
          
          {/* Trending Slider with Auto-scroll */}
          <TrendingSlider />
          
          {/* Dailywear Jewellery Section */}
          <DailywearSection />
          
          {/* Random Reviews Carousel */}
          <RandomReviewsCarousel />
          
          {/* Art of Silver Editorial - with auto-shuffle */}
          <LuxuryEditorialSection />
          
          {/* Video Showcase */}
          <VideoShowcase />
          
          {/* Featured Categories */}
          <FeaturedCategories />
          
          {/* Seasonal Banners */}
          <SeasonalBanner />
          
          {/* Promo Banners */}
          <PromoBanners />
          
          {/* Brand Story */}
          <BrandStorySection />
          
          {/* Our Collections */}
          <CollectionsStory />
          
          {/* Shop by Occasion */}
          <ShopByOccasion />
          
          {/* Silver Care Guide */}
          <SilverCareSection />
          
          {/* Brand Partners / As Featured In */}
          <BrandPartners />
          
          {/* Customer Reviews */}
          <PremiumReviewsSection />
          
          {/* Instagram Feed */}
          <InstagramFeed />
          
          {/* Newsletter */}
          <NewsletterSection />
          
          {/* Recently Viewed */}
          <RecentlyViewed />
          
          {/* Final CTA */}
          <FinalCTA />
        </main>
        
        <Footer />
      </div>
    </FirstTimePopup>
  );
};

export default Index;