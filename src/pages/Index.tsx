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
import WeddingCollectionShowcase from '@/components/home/WeddingCollectionShowcase';
import MonsoonSaleBanner from '@/components/home/MonsoonSaleBanner';
import LuxuryEditorialSection from '@/components/home/LuxuryEditorialSection';
import TrustCertificationBadges from '@/components/home/TrustCertificationBadges';
import SeasonalBanner from '@/components/home/SeasonalBanner';
import BrandStorySection from '@/components/home/BrandStorySection';
import { OrganizationSchema, WebsiteSchema, FAQSchema } from '@/components/seo/ProductSchema';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebsiteSchema />
      <FAQSchema />
      
      <Header />
      
      <main>
        <VideoHeroSection />
        <CountdownBanner />
        <TrustStrip />
        <CategoriesCarousel />
        <BestsellersGrid />
        <WeddingCollectionShowcase />
        <ParallaxBanner />
        <NewArrivalsGrid />
        <MonsoonSaleBanner />
        <TrendingSlider />
        <LuxuryEditorialSection />
        <VideoShowcase />
        <FeaturedCategories />
        <SeasonalBanner />
        <PromoBanners />
        <BrandStorySection />
        <CollectionsStory />
        <ShopByOccasion />
        <TrustCertificationBadges />
        <SilverCareSection />
        <BrandPartners />
        <PremiumReviewsSection />
        <InstagramFeed />
        <NewsletterSection />
        <RecentlyViewed />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
