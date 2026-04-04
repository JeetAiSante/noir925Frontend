import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Page Not Found" noIndex={true} />
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center max-w-lg mx-auto">
          {/* Decorative 404 */}
          <div className="relative mb-8">
            <h1 className="font-display text-[120px] md:text-[180px] font-bold leading-none text-primary/10">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            </div>
          </div>

          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3">
            Page Not Found
          </h2>
          <p className="text-muted-foreground font-body mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="luxury" size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <ShoppingBag className="w-4 h-4" />
                Browse Shop
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
