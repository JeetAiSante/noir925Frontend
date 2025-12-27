import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, products, categories } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // Fallback to simple matching
      return new Response(JSON.stringify({ 
        suggestions: generateFallbackSuggestions(query, products, categories)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("AI Search: Processing query:", query);

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

Available product names: ${products?.slice(0, 20).join(', ') || 'rings, necklaces, bracelets, earrings'}
Available categories: ${categories?.join(', ') || 'Rings, Necklaces, Bracelets, Earrings, Pendants'}

Return ONLY a JSON array of strings with no explanation. Example: ["silver ring", "silver necklace for women", "925 silver bracelet"]`
          },
          {
            role: "user",
            content: `Suggest search completions for: "${query}"`
          }
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429 || response.status === 402) {
        return new Response(JSON.stringify({ 
          suggestions: generateFallbackSuggestions(query, products, categories),
          fallback: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    console.log("AI Response:", content);

    // Parse the JSON array from the response
    let suggestions: string[] = [];
    try {
      // Extract JSON array from response (might have extra text)
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      suggestions = generateFallbackSuggestions(query, products, categories);
    }

    return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 5) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in ai-search-suggest function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      suggestions: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackSuggestions(query: string, products?: string[], categories?: string[]): string[] {
  const q = query.toLowerCase();
  const suggestions: string[] = [];
  
  // Common jewelry search patterns
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
  
  // Add category-based suggestions
  if (categories) {
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(q)) {
        suggestions.push(cat.toLowerCase());
      }
    });
  }
  
  // Add product-based suggestions
  if (products) {
    products.forEach(prod => {
      if (prod.toLowerCase().includes(q) && suggestions.length < 5) {
        suggestions.push(prod);
      }
    });
  }
  
  // Fill with patterns
  patterns.forEach(p => {
    if (suggestions.length < 5 && !suggestions.includes(p)) {
      suggestions.push(p);
    }
  });
  
  return suggestions.slice(0, 5);
}