import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Ruler, Info } from 'lucide-react';

const ringSizes = [
  { us: '4', uk: 'H', eu: '46.8', diameter: '14.9', circumference: '46.8' },
  { us: '5', uk: 'J', eu: '49.3', diameter: '15.7', circumference: '49.3' },
  { us: '6', uk: 'L', eu: '51.9', diameter: '16.5', circumference: '51.9' },
  { us: '7', uk: 'N', eu: '54.4', diameter: '17.3', circumference: '54.4' },
  { us: '8', uk: 'P', eu: '57.0', diameter: '18.1', circumference: '57.0' },
  { us: '9', uk: 'R', eu: '59.5', diameter: '18.9', circumference: '59.5' },
  { us: '10', uk: 'T', eu: '62.1', diameter: '19.8', circumference: '62.1' },
  { us: '11', uk: 'V', eu: '64.6', diameter: '20.6', circumference: '64.6' },
  { us: '12', uk: 'X', eu: '67.2', diameter: '21.4', circumference: '67.2' },
];

const braceletSizes = [
  { size: 'XS', circumference: '14-15 cm', wrist: 'Very petite wrist' },
  { size: 'S', circumference: '15-16 cm', wrist: 'Petite wrist' },
  { size: 'M', circumference: '16-17 cm', wrist: 'Average wrist' },
  { size: 'L', circumference: '17-18 cm', wrist: 'Larger wrist' },
  { size: 'XL', circumference: '18-19 cm', wrist: 'Extra large wrist' },
];

const necklaceSizes = [
  { length: '14"', cm: '35 cm', style: 'Collar', description: 'Sits tight around the neck' },
  { length: '16"', cm: '40 cm', style: 'Choker', description: 'Rests at the base of the neck' },
  { length: '18"', cm: '45 cm', style: 'Princess', description: 'Most popular length, sits below collarbone' },
  { length: '20"', cm: '50 cm', style: 'Matinee', description: 'Falls between collarbone and bust' },
  { length: '24"', cm: '60 cm', style: 'Opera', description: 'Falls at or below the bust line' },
  { length: '30"+', cm: '76+ cm', style: 'Rope', description: 'Falls below bust, can be doubled' },
];

const SizeGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Size Guide - Ring, Bracelet & Necklace Sizes | NOIR925"
        description="Find your perfect fit with our comprehensive size guide for rings, bracelets, and necklaces. Easy measuring tips and size charts for silver jewellery."
        keywords="ring size guide, bracelet size chart, necklace length guide, jewellery sizing, how to measure ring size"
      />
      <Header />

      <main className="pt-8 pb-16">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16 mb-8">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              Size Guide
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find your perfect fit with our comprehensive sizing charts
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <Tabs defaultValue="rings" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="rings">Rings</TabsTrigger>
              <TabsTrigger value="bracelets">Bracelets</TabsTrigger>
              <TabsTrigger value="necklaces">Necklaces</TabsTrigger>
            </TabsList>

            {/* Rings Tab */}
            <TabsContent value="rings" className="space-y-8">
              {/* How to Measure */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    How to Measure Your Ring Size
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Method 1: Existing Ring</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Find a ring that fits the intended finger well</li>
                        <li>Measure the inside diameter in millimeters</li>
                        <li>Match the diameter to the chart below</li>
                      </ol>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Method 2: String/Paper</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Wrap a string or paper strip around your finger</li>
                        <li>Mark where the ends meet</li>
                        <li>Measure the length in millimeters</li>
                        <li>Match to the circumference in the chart</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Size Chart */}
              <Card>
                <CardContent className="p-6 overflow-x-auto">
                  <h2 className="font-display text-xl mb-4">Ring Size Chart</h2>
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">US Size</th>
                        <th className="text-left py-3 px-4 font-medium">UK Size</th>
                        <th className="text-left py-3 px-4 font-medium">EU Size</th>
                        <th className="text-left py-3 px-4 font-medium">Diameter (mm)</th>
                        <th className="text-left py-3 px-4 font-medium">Circumference (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ringSizes.map((size, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 font-semibold text-primary">{size.us}</td>
                          <td className="py-3 px-4">{size.uk}</td>
                          <td className="py-3 px-4">{size.eu}</td>
                          <td className="py-3 px-4">{size.diameter}</td>
                          <td className="py-3 px-4">{size.circumference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bracelets Tab */}
            <TabsContent value="bracelets" className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    How to Measure Your Wrist
                  </h2>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>1. Use a flexible measuring tape or a strip of paper</p>
                    <p>2. Wrap it around your wrist just above the wrist bone</p>
                    <p>3. Note where the tape meets - this is your wrist measurement</p>
                    <p className="text-primary font-medium">Tip: Add 1-2 cm for a comfortable, looser fit</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 overflow-x-auto">
                  <h2 className="font-display text-xl mb-4">Bracelet Size Chart</h2>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Size</th>
                        <th className="text-left py-3 px-4 font-medium">Wrist Circumference</th>
                        <th className="text-left py-3 px-4 font-medium">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {braceletSizes.map((size, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 font-semibold text-primary">{size.size}</td>
                          <td className="py-3 px-4">{size.circumference}</td>
                          <td className="py-3 px-4 text-muted-foreground">{size.wrist}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Necklaces Tab */}
            <TabsContent value="necklaces" className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Choosing the Right Necklace Length
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    The right necklace length depends on your neckline, face shape, and personal style. 
                    16-18" is the most versatile and popular length for everyday wear.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 overflow-x-auto">
                  <h2 className="font-display text-xl mb-4">Necklace Length Guide</h2>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Length</th>
                        <th className="text-left py-3 px-4 font-medium">Metric</th>
                        <th className="text-left py-3 px-4 font-medium">Style</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {necklaceSizes.map((size, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-4 font-semibold text-primary">{size.length}</td>
                          <td className="py-3 px-4">{size.cm}</td>
                          <td className="py-3 px-4 font-medium">{size.style}</td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">{size.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tips */}
          <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border">
            <h3 className="font-display text-lg mb-4">💡 Sizing Tips</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Measure at the end of the day when fingers are slightly larger
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Avoid measuring when hands are cold (they shrink in cold)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                If between sizes, choose the larger size for comfort
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Contact us for free resizing assistance
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SizeGuide;
