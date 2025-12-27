import { lazy, Suspense, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { FestivalThemeProvider } from "@/context/FestivalThemeContext";
import PwaManifestLink from "@/components/pwa/PwaManifestLink";

// Eagerly loaded components for critical path
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";

// Lazy loaded components for better code splitting
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const SilverCare = lazy(() => import("./pages/SilverCare"));
const Collections = lazy(() => import("./pages/Collections"));
const Contact = lazy(() => import("./pages/Contact"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OTPLogin = lazy(() => import("./pages/OTPLogin"));
const FAQ = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnsPolicy = lazy(() => import("./pages/ReturnsPolicy"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Gifting = lazy(() => import("./pages/Gifting"));
const FestivalPage = lazy(() => import("./pages/FestivalPage"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSales = lazy(() => import("./pages/admin/AdminSales"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminTimers = lazy(() => import("./pages/admin/AdminTimers"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminFestivalThemes = lazy(() => import("./pages/admin/AdminFestivalThemes"));
const AdminSpinWheel = lazy(() => import("./pages/admin/AdminSpinWheel"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminLoyalty = lazy(() => import("./pages/admin/AdminLoyalty"));
const AdminFeatureToggles = lazy(() => import("./pages/admin/AdminFeatureToggles"));
const AdminGiftCards = lazy(() => import("./pages/admin/AdminGiftCards"));
const AdminTrustBadges = lazy(() => import("./pages/admin/AdminTrustBadges"));
const AdminHomepageSections = lazy(() => import("./pages/admin/AdminHomepageSections"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

// Performance-optimized cursor - lazy load as non-critical
const LuxuryCursor = lazy(() => import("@/components/LuxuryCursor"));
const InstallPWAPrompt = lazy(() => import("@/components/pwa/InstallPWAPrompt"));
const ScrollToTop = lazy(() => import("@/components/ScrollToTop"));

// Optimized QueryClient with caching and stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// Minimal loading fallback
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));
PageLoader.displayName = 'PageLoader';

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <PwaManifestLink />
    <TooltipProvider delayDuration={0}>
      <AuthProvider>
        <FestivalThemeProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <LuxuryCursor />
              <InstallPWAPrompt />
            </Suspense>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={null}>
                <ScrollToTop />
              </Suspense>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Critical routes - eagerly loaded */}
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/:category" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  
                  {/* Secondary routes - lazy loaded */}
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/otp-login" element={<OTPLogin />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/silver-care" element={<SilverCare />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collections/:slug" element={<Collections />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/shipping" element={<ShippingPolicy />} />
                  <Route path="/returns-policy" element={<ReturnsPolicy />} />
                  <Route path="/returns" element={<ReturnsPolicy />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/gifting" element={<Gifting />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/festival" element={<FestivalPage />} />
                  <Route path="/festival/:slug" element={<FestivalPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="sales" element={<AdminSales />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="timers" element={<AdminTimers />} />
                    <Route path="themes" element={<AdminFestivalThemes />} />
                    <Route path="spin-wheel" element={<AdminSpinWheel />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="loyalty" element={<AdminLoyalty />} />
                    <Route path="feature-toggles" element={<AdminFeatureToggles />} />
                    <Route path="gift-cards" element={<AdminGiftCards />} />
                    <Route path="trust-badges" element={<AdminTrustBadges />} />
                    <Route path="homepage-sections" element={<AdminHomepageSections />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </FestivalThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
));

App.displayName = 'App';

export default App;