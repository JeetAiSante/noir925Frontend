import { Truck, Clock, MapPin, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const ShippingPolicy = () => {
  // Shipping Policy Schema
  const shippingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Shipping Policy - NOIR925",
    "description": "NOIR925 shipping information including delivery times, charges, and tracking for 925 sterling silver jewelry orders across India.",
    "url": "https://noir925.com/shipping-policy",
    "mainEntity": {
      "@type": "Organization",
      "name": "NOIR925",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping Policy - Free Delivery & Fast Shipping"
        description="Free shipping on orders above ₹999. NOIR925 delivers 925 sterling silver jewelry across India in 3-7 business days with secure, tamper-proof packaging."
        canonicalUrl="https://noir925.com/shipping-policy"
        keywords="NOIR925 shipping, jewelry delivery India, free shipping silver jewelry, order tracking, express delivery jewelry"
        structuredData={shippingSchema}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Shipping Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            We are committed to delivering your precious jewelry safely and on time.
          </p>

          {/* Shipping Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'Above ₹999' },
              { icon: Clock, label: '5-7 Days', desc: 'Standard Delivery' },
              { icon: MapPin, label: 'Pan India', desc: 'All Pincodes' },
              { icon: Package, label: 'Secure', desc: 'Tamper-Proof' },
            ].map((item, index) => (
              <div key={index} className="text-center p-4 bg-muted/50 rounded-xl">
                <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">Shipping Charges</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Orders above ₹999: FREE shipping</li>
                <li>Orders below ₹999: ₹49 flat shipping charge</li>
                <li>Express Shipping: ₹149 (2-3 business days)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">Delivery Timeline</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Metro Cities: 3-5 business days</li>
                <li>Other Cities: 5-7 business days</li>
                <li>Remote Areas: 7-10 business days</li>
                <li>Express Delivery: 2-3 business days (metro cities only)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">Order Processing</h2>
              <p className="text-muted-foreground leading-relaxed">
                Orders are processed within 24-48 hours of payment confirmation. You will receive a confirmation 
                email with tracking details once your order is shipped. Orders placed on weekends or holidays 
                will be processed on the next business day.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">Packaging</h2>
              <p className="text-muted-foreground leading-relaxed">
                All jewelry is carefully packaged in our signature gift boxes with tamper-proof sealing. 
                Each piece comes with a certificate of authenticity and care instructions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">Tracking Your Order</h2>
              <p className="text-muted-foreground leading-relaxed">
                Once shipped, you will receive tracking information via email and SMS. You can also track 
                your order on our Track Order page using your order number.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
