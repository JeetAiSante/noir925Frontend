import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://noir925.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'index'

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date().toISOString().split('T')[0]

    // Handle different sitemap types
    if (type === 'index') {
      // Return sitemap index
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=pages</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=products</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=images</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=categories</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=collections</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/api/sitemap?type=festivals</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`

      return new Response(sitemapIndex, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    if (type === 'pages') {
      // Static pages sitemap
      const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/shop', priority: '0.95', changefreq: 'daily' },
        { loc: '/collections', priority: '0.85', changefreq: 'weekly' },
        { loc: '/gifting', priority: '0.8', changefreq: 'weekly' },
        { loc: '/about', priority: '0.7', changefreq: 'monthly' },
        { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
        { loc: '/faq', priority: '0.7', changefreq: 'monthly' },
        { loc: '/silver-care', priority: '0.75', changefreq: 'monthly' },
        { loc: '/track-order', priority: '0.6', changefreq: 'monthly' },
        { loc: '/auth', priority: '0.5', changefreq: 'monthly' },
        { loc: '/cart', priority: '0.5', changefreq: 'always' },
        { loc: '/wishlist', priority: '0.5', changefreq: 'always' },
        { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
        { loc: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
        { loc: '/shipping-policy', priority: '0.4', changefreq: 'monthly' },
        { loc: '/returns-policy', priority: '0.4', changefreq: 'monthly' },
      ]

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`
      for (const page of staticPages) {
        sitemap += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
      }
      sitemap += `</urlset>`

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    if (type === 'products') {
      // Products sitemap with image support
      const { data: products, error } = await supabase
        .from('products')
        .select('slug, name, updated_at, images')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`
      if (products) {
        for (const product of products) {
          const lastmod = product.updated_at ? product.updated_at.split('T')[0] : today
          const images = Array.isArray(product.images) ? product.images : []
          
          sitemap += `  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`
          // Add image entries
          for (const imageUrl of images.slice(0, 5)) {
            if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
              sitemap += `    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${product.name} - NOIR925 Silver Jewellery</image:title>
      <image:caption>${product.name} - Premium 925 Sterling Silver</image:caption>
    </image:image>
`
            }
          }
          sitemap += `  </url>
`
        }
      }
      sitemap += `</urlset>`

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    if (type === 'images') {
      // Dedicated image sitemap for better media indexing
      const { data: products, error } = await supabase
        .from('products')
        .select('slug, name, images')
        .eq('is_active', true)

      if (error) throw error

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`
      if (products) {
        for (const product of products) {
          const images = Array.isArray(product.images) ? product.images : []
          if (images.length > 0) {
            sitemap += `  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
`
            for (const imageUrl of images) {
              if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
                sitemap += `    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>NOIR925 Premium 925 Sterling Silver ${product.name}</image:caption>
      <image:geo_location>India</image:geo_location>
      <image:license>${SITE_URL}/terms-conditions</image:license>
    </image:image>
`
              }
            }
            sitemap += `  </url>
`
          }
        }
      }
      sitemap += `</urlset>`

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=7200',
        },
      })
    }

    if (type === 'categories') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('slug, updated_at, image_url, name')
        .eq('is_active', true)

      if (error) throw error

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`
      if (categories) {
        for (const category of categories) {
          const lastmod = category.updated_at ? category.updated_at.split('T')[0] : today
          sitemap += `  <url>
    <loc>${SITE_URL}/shop?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
`
          if (category.image_url) {
            sitemap += `    <image:image>
      <image:loc>${category.image_url}</image:loc>
      <image:title>${category.name} - NOIR925</image:title>
    </image:image>
`
          }
          sitemap += `  </url>
`
        }
      }
      sitemap += `</urlset>`

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    if (type === 'collections') {
      const { data: collections, error } = await supabase
        .from('collections')
        .select('slug, updated_at, image_url, name')
        .eq('is_active', true)

      if (error) throw error

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`
      if (collections) {
        for (const collection of collections) {
          const lastmod = collection.updated_at ? collection.updated_at.split('T')[0] : today
          sitemap += `  <url>
    <loc>${SITE_URL}/collections?collection=${collection.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
`
          if (collection.image_url) {
            sitemap += `    <image:image>
      <image:loc>${collection.image_url}</image:loc>
      <image:title>${collection.name} Collection - NOIR925</image:title>
    </image:image>
`
          }
          sitemap += `  </url>
`
        }
      }
      sitemap += `</urlset>`

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    if (type === 'festivals') {
      // Festival themes sitemap
      const { data: festivals, error } = await supabase
        .from('festival_themes')
        .select('slug, updated_at, banner_image, name')

      if (error) throw error

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`
      if (festivals) {
        for (const festival of festivals) {
          const lastmod = festival.updated_at ? festival.updated_at.split('T')[0] : today
          sitemap += `  <url>
    <loc>${SITE_URL}/festival/${festival.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
`
          if (festival.banner_image) {
            sitemap += `    <image:image>
      <image:loc>${festival.banner_image}</image:loc>
      <image:title>${festival.name} Sale - NOIR925</image:title>
    </image:image>
`
          }
          sitemap += `  </url>
`
        }
      }
      sitemap += `</urlset>`

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // Default: return full sitemap (backward compatibility)
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)

    const { data: collections } = await supabase
      .from('collections')
      .select('slug, updated_at')
      .eq('is_active', true)

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/shop', priority: '0.95', changefreq: 'daily' },
      { loc: '/collections', priority: '0.85', changefreq: 'weekly' },
      { loc: '/gifting', priority: '0.8', changefreq: 'weekly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.7', changefreq: 'monthly' },
      { loc: '/silver-care', priority: '0.75', changefreq: 'monthly' },
      { loc: '/track-order', priority: '0.6', changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/terms-conditions', priority: '0.3', changefreq: 'yearly' },
      { loc: '/shipping-policy', priority: '0.4', changefreq: 'monthly' },
      { loc: '/returns-policy', priority: '0.4', changefreq: 'monthly' },
    ]

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    if (categories) {
      for (const category of categories) {
        const lastmod = category.updated_at ? category.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/shop?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`
      }
    }

    if (collections) {
      for (const collection of collections) {
        const lastmod = collection.updated_at ? collection.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/collections?collection=${collection.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
`
      }
    }

    if (products) {
      for (const product of products) {
        const lastmod = product.updated_at ? product.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
      }
    }

    sitemap += `</urlset>`

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
