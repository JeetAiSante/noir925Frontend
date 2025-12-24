import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, make a purchase, 
                subscribe to our newsletter, or contact us for support. This includes your name, email address, 
                shipping address, phone number, and payment information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to process orders, communicate with you about products and services, 
                personalize your shopping experience, prevent fraud, and improve our website and services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information 
                with trusted service providers who assist us in operating our website, processing payments, and delivering orders.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information. All payment 
                transactions are encrypted using SSL technology. However, no method of transmission over the Internet 
                is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. You can do this 
                by logging into your account or contacting our customer support team.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@noir925.com or 
                through our Contact page.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
