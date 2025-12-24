import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the NOIR925 website, you agree to be bound by these Terms and Conditions. 
                If you do not agree with any part of these terms, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">2. Products and Pricing</h2>
              <p className="text-muted-foreground leading-relaxed">
                All products displayed on our website are subject to availability. Prices are listed in Indian Rupees (INR) 
                and are inclusive of applicable taxes. We reserve the right to modify prices without prior notice.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">3. Orders and Payment</h2>
              <p className="text-muted-foreground leading-relaxed">
                By placing an order, you agree to provide accurate and complete information. We reserve the right to 
                cancel or refuse any order for any reason, including suspected fraud or unauthorized transactions.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">4. Shipping and Delivery</h2>
              <p className="text-muted-foreground leading-relaxed">
                Delivery times are estimates and may vary based on location and other factors. NOIR925 is not 
                responsible for delays caused by shipping carriers or unforeseen circumstances.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Please refer to our Returns Policy for detailed information on returns, exchanges, and refunds.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this website, including images, text, logos, and designs, is the property of NOIR925 
                and is protected by intellectual property laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                NOIR925 shall not be liable for any indirect, incidental, or consequential damages arising from the 
                use of our products or website.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">8. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For any questions regarding these Terms, please contact us at legal@noir925.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsConditions;
