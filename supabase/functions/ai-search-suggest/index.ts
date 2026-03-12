import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, products, categories } = await req.json();

    // Validate and sanitize inputs
    if (!query || typeof query !== 'string' || query.length < 2 || query.length > 200) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit products and categories arrays
    const safeProducts = Array.isArray(products) ? products.slice(0, 20).map((p: unknown) => String(p).slice(0, 100)) : [];
    const safeCategories = Array.isArray(categories) ? categories.slice(0, 10).map((c: unknown) => String(c).slice(0, 50)) : [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(JSON.stringify({ 
        suggestions: generateFallbackSuggestions(query, safeProducts, safeCategories)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("AI Search: Processing query for authenticated user");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a search autocomplete assistant for a silver jewelry store called NOIR925. 
Given a partial search query, suggest 5 relevant search completions.

Available product names: ${safeProducts.join(', ') || 'rings, necklaces, bracelets, earrings'}
Available categories: ${safeCategories.join(', ') || 'Rings, Necklaces, Bracelets, Earrings, Pendants'}

Return ONLY a JSON array of strings with no explanation. Example: ["silver ring", "silver necklace for women", "925 silver bracelet"]`
          },
          {
            role: "user",
            content: `Suggest search completions for: "${query.slice(0, 200)}"`
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      
      if (response.status === 429 || response.status === 402) {
        return new Response(JSON.stringify({ 
          suggestions: generateFallbackSuggestions(query, safeProducts, safeCategories),
          fallback: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    let suggestions: string[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Error parsing AI response");
      suggestions = generateFallbackSuggestions(query, safeProducts, safeCategories);
    }

    return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 5) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in ai-search-suggest function:", error);
    return new Response(JSON.stringify({ 
      error: 'An internal error occurred.',
      suggestions: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackSuggestions(query: string, products?: string[], categories?: string[]): string[] {
  const q = query.toLowerCase().slice(0, 100);
  const suggestions: string[] = [];
  
  const patterns = [
    `${q} for women`,
    `${q} for men`,
    `silver ${q}`,
    `925 ${q}`,
    `${q} necklace`,
    `${q} ring`,
    `${q} bracelet`,
    `${q} earrings`,
  ];
  
  if (categories) {
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(q)) {
        suggestions.push(cat.toLowerCase());
      }
    });
  }
  
  if (products) {
    products.forEach(prod => {
      if (prod.toLowerCase().includes(q) && suggestions.length < 5) {
        suggestions.push(prod);
      }
    });
  }
  
  patterns.forEach(p => {
    if (suggestions.length < 5 && !suggestions.includes(p)) {
      suggestions.push(p);
    }
  });
  
  return suggestions.slice(0, 5);
}
