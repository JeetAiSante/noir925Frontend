import { memo, lazy, Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useHomepageSections } from '@/hooks/useHomepageSections';
import { OrganizationSchema, WebsiteSchema, FAQSchema } from '@/components/seo/ProductSchema';
import { SEOHead, LocalBusinessSchema } from '@/components/seo/SEOHead';
import FirstTimePopup from '@/components/popups/FirstTimePopup';

// Eagerly loaded critical sections
import LuxuryHeroSection from '@/components/home/LuxuryHeroSection';
import TrustStrip from '@/components/home/TrustStrip';
import CountdownBanner from '@/components/home/CountdownBanner';
import FestivalBanner from '@/components/home/FestivalBanner';

// Lazy loaded sections for performance
const CategoriesCarousel = lazy(() => import('@/components/home/CategoriesCarousel'));
const BestsellersGrid = lazy(() => import('@/components/home/BestsellersGrid'));
const PriceBasedProducts = lazy(() => import('@/components/home/PriceBasedProducts'));
const GenderShopSection = lazy(() => import('@/components/home/GenderShopSection'));
const WeddingCollectionShowcase = lazy(() => import('@/components/home/WeddingCollectionShowcase'));
const GiftBoxCategories = lazy(() => import('@/components/home/GiftBoxCategories'));
const ParallaxBanner = lazy(() => import('@/components/home/ParallaxBanner'));
const NewArrivalsGrid = lazy(() => import('@/components/home/NewArrivalsGrid'));
const TrendingSlider = lazy(() => import('@/components/home/TrendingSlider'));
const DailywearSection = lazy(() => import('@/components/home/DailywearSection'));
const RandomReviewsCarousel = lazy(() => import('@/components/home/RandomReviewsCarousel'));
const LuxuryEditorialSection = lazy(() => import('@/components/home/LuxuryEditorialSection'));
const VideoShowcase = lazy(() => import('@/components/home/VideoShowcase'));
const FeaturedCategories = lazy(() => import('@/components/home/FeaturedCategories'));
const SeasonalBanner = lazy(() => import('@/components/home/SeasonalBanner'));
const PromoBanners = lazy(() => import('@/components/home/PromoBanners'));
const BrandStorySection = lazy(() => import('@/components/home/BrandStorySection'));
const CollectionsStory = lazy(() => import('@/components/home/CollectionsStory'));
const ShopByOccasion = lazy(() => import('@/components/home/ShopByOccasion'));
const SilverCareSection = lazy(() => import('@/components/home/SilverCareSection'));
const BrandPartners = lazy(() => import('@/components/home/BrandPartners'));
const PremiumReviewsSection = lazy(() => import('@/components/home/PremiumReviewsSection'));
const InstagramFeed = lazy(() => import('@/components/home/InstagramFeed'));
const NewsletterSection = lazy(() => import('@/components/home/NewsletterSection'));
const RecentlyViewed = lazy(() => import('@/components/home/RecentlyViewed'));
const FinalCTA = lazy(() => import('@/components/home/FinalCTA'));

// Section loading placeholder
const SectionLoader = memo(() => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));
SectionLoader.displayName = 'SectionLoader';

// Section component mapping - keys match database section_key values
const sectionComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>> = {
  // Critical sections
  video_hero: LuxuryHeroSection,
  hero: LuxuryHeroSection,
  countdown_banner: CountdownBanner,
  countdown: CountdownBanner,
  festival_banner: FestivalBanner,
  festival: FestivalBanner,
  trust_strip: TrustStrip,
  
  // Categories and products
  categories_carousel: CategoriesCarousel,
  categories: CategoriesCarousel,
  bestsellers: BestsellersGrid,
  bestsellers_grid: BestsellersGrid,
  price_based: PriceBasedProducts,
  price_based_products: PriceBasedProducts,
  gender_shop: GenderShopSection,
  wedding_collection: WeddingCollectionShowcase,
  wedding: WeddingCollectionShowcase,
  gift_box: GiftBoxCategories,
  
  // Banners
  parallax_banner: ParallaxBanner,
  parallax: ParallaxBanner,
  seasonal_banner: SeasonalBanner,
  seasonal: SeasonalBanner,
  promo_banners: PromoBanners,
  promo: PromoBanners,
  
  // Product sections
  new_arrivals: NewArrivalsGrid,
  trending_slider: TrendingSlider,
  trending: TrendingSlider,
  dailywear: DailywearSection,
  
  // Editorial and showcase
  editorial_section: LuxuryEditorialSection,
  editorial: LuxuryEditorialSection,
  video_showcase: VideoShowcase,
  featured_categories: FeaturedCategories,
  
  // Story and brand
  brand_story: BrandStorySection,
  collections_story: CollectionsStory,
  collections: CollectionsStory,
  shop_by_occasion: ShopByOccasion,
  occasion: ShopByOccasion,
  silver_care: SilverCareSection,
  brand_partners: BrandPartners,
  partners: BrandPartners,
  
  // Reviews
  reviews: PremiumReviewsSection,
  reviews_carousel: RandomReviewsCarousel,
  
  // Social and newsletter
  instagram_feed: InstagramFeed,
  instagram: InstagramFeed,
  newsletter: NewsletterSection,
  
  // Other
  recently_viewed: RecentlyViewed,
  final_cta: FinalCTA,
};

const Index = memo(() => {
  const { sections, loading, isSectionVisible } = useHomepageSections();

  // Default section order when DB not loaded yet
  const defaultOrder = [
    'video_hero', 'countdown_banner', 'trust_strip', 'categories_carousel', 'bestsellers',
    'gender_shop', 'wedding_collection', 'parallax_banner', 'new_arrivals',
    'trending_slider', 'editorial_section', 'video_showcase',
    'featured_categories', 'seasonal_banner', 'promo_banners', 'brand_story', 'collections_story',
    'shop_by_occasion', 'silver_care', 'brand_partners', 'reviews', 'instagram_feed', 'newsletter',
    'recently_viewed', 'final_cta'
  ];

  // Use DB order if loaded, otherwise default
  const orderedSections = sections.length > 0 
    ? sections.map(s => s.section_key) 
    : defaultOrder;

  return (
    <FirstTimePopup>
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Premium 925 Sterling Silver Jewellery | NOIR925"
          description="Discover exquisite handcrafted 925 sterling silver jewellery at NOIR925. Shop luxury rings, necklaces, bracelets & earrings with BIS Hallmark certification. Free shipping on ₹2000+."
          keywords="925 sterling silver jewellery India, silver rings online, silver necklace for women, silver bracelet, silver earrings, handcrafted silver jewellery, BIS hallmark silver, luxury silver jewellery, pure silver jewellery online, NOIR925"
          canonicalUrl="https://noir925.com"
          ogType="website"
        />
        <OrganizationSchema />
        <WebsiteSchema />
        <FAQSchema />
        <LocalBusinessSchema />
        
        <Header />
        
        <main className="overflow-hidden" role="main">
          {orderedSections.map((sectionKey) => {
            // Check visibility
            if (!isSectionVisible(sectionKey)) return null;
            
            const Component = sectionComponents[sectionKey];
            if (!Component) return null;

            // Critical sections don't need Suspense wrapper
            if (['video_hero', 'hero', 'countdown_banner', 'countdown', 'festival_banner', 'festival', 'trust_strip'].includes(sectionKey)) {
              return <Component key={sectionKey} />;
            }

            // Lazy sections with Suspense
            return (
              <Suspense key={sectionKey} fallback={<SectionLoader />}>
                <Component />
              </Suspense>
            );
          })}
        </main>
        
        <Footer />
      </div>
    </FirstTimePopup>
  );
});

Index.displayName = 'Index';

export default Index;
