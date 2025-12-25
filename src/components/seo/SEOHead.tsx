import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  structuredData?: object;
  product?: {
    name: string;
    price: number;
    currency?: string;
    image: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    brand?: string;
    sku?: string;
    rating?: number;
    reviewCount?: number;
  };
}

const defaultMeta = {
  title: 'NOIR925 | Premium 925 Sterling Silver Jewellery India',
  description: 'Shop exquisite handcrafted 925 sterling silver jewellery at NOIR925. Discover luxury rings, necklaces, bracelets, earrings & more with BIS Hallmark certification. Free shipping on ₹2000+. 30-day returns.',
  keywords: '925 sterling silver jewellery, silver rings online India, silver necklace, silver bracelet, silver earrings, handcrafted silver jewellery, BIS hallmark silver, luxury silver jewellery India, pure silver jewellery, NOIR925',
  ogImage: 'https://noir925.com/og-image.jpg',
  siteUrl: 'https://noir925.com',
};

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  noIndex = false,
  structuredData,
  product,
}: SEOHeadProps) => {
  const pageTitle = title 
    ? `${title} | NOIR925 - Premium Silver Jewellery`
    : defaultMeta.title;
  const pageDescription = description || defaultMeta.description;
  const pageKeywords = keywords || defaultMeta.keywords;
  const pageImage = ogImage || defaultMeta.ogImage;
  const pageUrl = canonicalUrl || defaultMeta.siteUrl;

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    // Primary meta tags
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Open Graph
    updateMetaTag('og:title', pageTitle, true);
    updateMetaTag('og:description', pageDescription, true);
    updateMetaTag('og:image', pageImage, true);
    updateMetaTag('og:url', pageUrl, true);
    updateMetaTag('og:type', ogType, true);

    // Twitter
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', pageImage);

    // Update canonical
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', pageUrl);
    } else {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      canonicalTag.setAttribute('href', pageUrl);
      document.head.appendChild(canonicalTag);
    }

    // Cleanup function
    return () => {
      document.title = defaultMeta.title;
    };
  }, [pageTitle, pageDescription, pageKeywords, pageImage, pageUrl, ogType, noIndex]);

  // Product structured data
  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "NOIR925"
    },
    "sku": product.sku,
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": product.currency || "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "NOIR925"
      }
    },
    ...(product.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toString(),
        "reviewCount": (product.reviewCount || 0).toString(),
        "bestRating": "5",
        "worstRating": "1"
      }
    })
  } : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  );
};

// Collection/Category Schema
export const CollectionSchema = ({ 
  name, 
  description, 
  url, 
  productCount 
}: { 
  name: string; 
  description: string; 
  url: string; 
  productCount: number;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${name} - NOIR925 Silver Jewellery`,
    "description": description,
    "url": url,
    "numberOfItems": productCount,
    "isPartOf": {
      "@type": "WebSite",
      "name": "NOIR925",
      "url": "https://noir925.com"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// Item List Schema for product listings
export const ItemListSchema = ({ 
  products, 
  listName 
}: { 
  products: Array<{ id: string; name: string; price: number; image: string; position?: number }>; 
  listName: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": product.position || index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "url": `https://noir925.com/product/${product.id}`,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": product.price
        }
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

// Local Business Schema
export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "NOIR925",
    "image": "https://noir925.com/storefront.jpg",
    "logo": "https://noir925.com/logo.png",
    "description": "Premium handcrafted 925 sterling silver jewellery with BIS Hallmark certification",
    "priceRange": "₹₹₹",
    "telephone": "+91-XXX-XXX-XXXX",
    "email": "support@noir925.com",
    "url": "https://noir925.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "India"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.0760",
      "longitude": "72.8777"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2500",
      "bestRating": "5"
    },
    "sameAs": [
      "https://instagram.com/noir925",
      "https://facebook.com/noir925",
      "https://pinterest.com/noir925"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "NOIR925 Jewellery Collection",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Sterling Silver Rings" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Sterling Silver Necklaces" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Sterling Silver Bracelets" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Sterling Silver Earrings" } }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SEOHead;