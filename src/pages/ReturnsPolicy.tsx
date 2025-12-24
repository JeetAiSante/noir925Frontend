import { RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ReturnsPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Returns & Refund Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Your satisfaction is our priority. Here's everything you need to know about returns.
          </p>

          {/* Policy Highlights */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-8 h-8 text-primary" />
              <h2 className="font-display text-xl text-foreground">7-Day Easy Returns</h2>
            </div>
            <p className="text-muted-foreground">
              Not satisfied with your purchase? Return it within 7 days of delivery for a full refund 
              or exchange. No questions asked.
            </p>
          </div>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-primary" />
                Eligible for Return
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Unused products in original condition</li>
                <li>Products with original tags and packaging intact</li>
                <li>Items returned within 7 days of delivery</li>
                <li>Products with manufacturing defects</li>
                <li>Wrong item delivered</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-destructive" />
                Not Eligible for Return
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Customized or personalized jewelry</li>
                <li>Products damaged due to misuse or negligence</li>
                <li>Products without original packaging or tags</li>
                <li>Items returned after 7 days</li>
                <li>Sale or clearance items (exchange only)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">How to Initiate a Return</h2>
              <ol className="text-muted-foreground space-y-3 list-decimal list-inside">
                <li>Log into your account and go to Order History</li>
                <li>Select the item you wish to return</li>
                <li>Choose reason for return and submit request</li>
                <li>Pack the item securely in original packaging</li>
                <li>Our pickup partner will collect within 2-3 days</li>
              </ol>
            </section>

            <section>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">Refund Process</h2>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Online Payments:</strong> Refund to original payment method within 5-7 business days</li>
                <li><strong>COD Orders:</strong> Refund via bank transfer within 7-10 business days</li>
                <li><strong>Exchange:</strong> Processed immediately upon receiving returned item</li>
              </ul>
            </section>

            <section className="bg-muted/50 p-6 rounded-xl">
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-accent" />
                Important Notes
              </h2>
              <ul className="text-muted-foreground space-y-2">
                <li>Shipping charges are non-refundable</li>
                <li>Quality check is performed on all returned items</li>
                <li>Refund amount may be reduced for damaged returns</li>
                <li>Gift cards are non-refundable</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReturnsPolicy;
