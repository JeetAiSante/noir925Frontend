import { Product, formatPrice } from '@/data/products';

interface ProductSchemaProps {
  product: Product;
}

export const ProductSchema = ({ product }: ProductSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": "NOIR925"
    },
    "sku": product.id,
    "mpn": product.id,
    "material": product.material,
    "offers": {
      "@type": "Offer",
      "url": `https://noir925.com/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "NOIR925"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.reviews.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "category": product.category,
    "weight": {
      "@type": "QuantitativeValue",
      "value": product.weight
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://noir925.com${item.url}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NOIR925",
    "alternateName": "NOIR Nine-Twenty-Five",
    "url": "https://noir925.com",
    "logo": "https://noir925.com/logo.png",
    "description": "Premium 925 Sterling Silver Jewellery - Handcrafted with love. Purity. Craft. Legacy.",
    "foundingDate": "2020",
    "sameAs": [
      "https://www.instagram.com/noir925",
      "https://www.facebook.com/noir925",
      "https://www.pinterest.com/noir925"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXX-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const WebsiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NOIR925",
    "url": "https://noir925.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://noir925.com/shop?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

interface CategorySchemaProps {
  categoryName: string;
  productCount: number;
}

export const CategorySchema = ({ categoryName, productCount }: CategorySchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryName} - NOIR925`,
    "description": `Shop premium 925 Sterling Silver ${categoryName} at NOIR925. Handcrafted with love.`,
    "url": `https://noir925.com/shop?category=${categoryName.toLowerCase()}`,
    "numberOfItems": productCount,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": productCount,
      "itemListElement": []
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const FAQSchema = () => {
  const faqs = [
    {
      question: "What is 925 Sterling Silver?",
      answer: "925 Sterling Silver contains 92.5% pure silver and 7.5% other metals (usually copper) for durability. All NOIR925 pieces are BIS Hallmarked for authenticity."
    },
    {
      question: "How do I care for my silver jewellery?",
      answer: "Store in a cool, dry place. Clean with a soft cloth. Avoid contact with perfumes, lotions, and water. Use our silver care guide for detailed instructions."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes, we offer free shipping on all orders above ₹999 across India. Express shipping options are also available."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day easy return policy. Items must be unused and in original packaging. Contact our support team to initiate a return."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
