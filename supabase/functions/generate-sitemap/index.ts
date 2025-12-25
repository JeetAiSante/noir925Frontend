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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (productsError) throw productsError

    // Fetch all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (categoriesError) throw categoriesError

    // Fetch all active collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (collectionsError) throw collectionsError

    const today = new Date().toISOString().split('T')[0]

    // Static pages with priorities
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }

    // Add category pages
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

    // Add collection pages
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

    // Add product pages
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
