import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqCategories = [
  {
    title: 'Orders & Shipping',
    faqs: [
      {
        question: 'How long does shipping take?',
        answer: 'We offer free shipping on all orders above ₹999. Standard delivery takes 5-7 business days, while express shipping (additional charges) delivers within 2-3 business days.',
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can use this number on our Track Order page or the courier partner\'s website.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we ship within India only. International shipping is coming soon.',
      },
    ],
  },
  {
    title: 'Payments',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery (COD) for orders under ₹10,000.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, all transactions are encrypted with 256-bit SSL security. We do not store your card details on our servers.',
      },
    ],
  },
  {
    title: 'Returns & Exchanges',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day return policy for unused products in original packaging with tags intact. Customized items cannot be returned.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Log into your account, go to Order History, and click "Return" on the item you wish to return. Our team will arrange a pickup.',
      },
    ],
  },
  {
    title: 'Product & Care',
    faqs: [
      {
        question: 'Is your silver genuine 925 sterling silver?',
        answer: 'Yes, all our silver jewelry is BIS Hallmarked 925 sterling silver with 92.5% purity certification.',
      },
      {
        question: 'How do I care for my silver jewelry?',
        answer: 'Store in a dry, airtight pouch. Avoid contact with perfumes and water. Clean with a soft cloth. Visit our Silver Care page for detailed instructions.',
      },
    ],
  },
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mb-8">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-3xl mx-auto space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-4">
                {category.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${categoryIndex}-${faqIndex}`}
                    className="border border-border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No FAQs found matching your search.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-2xl max-w-2xl mx-auto">
          <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            Our customer support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Contact Us
          </a>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;
