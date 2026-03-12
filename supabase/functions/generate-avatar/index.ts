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

    const { initials, fullName, style } = await req.json();
    
    // Validate and sanitize inputs
    if (!initials || typeof initials !== 'string') {
      throw new Error('Initials are required');
    }
    const safeInitials = initials.replace(/[^a-zA-Z]/g, '').slice(0, 2);
    const safeFullName = fullName && typeof fullName === 'string' ? fullName.slice(0, 100) : null;

    if (!safeInitials) {
      throw new Error('Valid initials are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, using fallback');
      const fallbackSvg = generateFallbackAvatar(safeInitials, safeFullName);
      return new Response(JSON.stringify({ 
        success: true, 
        avatarUrl: fallbackSvg,
        type: 'svg'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Create a luxurious minimalist avatar design featuring the initials "${safeInitials}" in an elegant serif font. The design should have a circular gradient background with subtle metallic shimmer effects, premium jewelry brand aesthetic, high-end boutique style with rose gold and champagne tones. Ultra high resolution, professional quality, suitable for a luxury silver jewelry brand profile picture. The initials should be prominently displayed in the center with artistic flourishes. Aspect ratio 1:1, circular avatar format.`;

    console.log('Generating avatar with Lovable AI for authenticated user');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      
      const fallbackSvg = generateFallbackAvatar(safeInitials, safeFullName);
      return new Response(JSON.stringify({ 
        success: true, 
        avatarUrl: fallbackSvg,
        type: 'svg',
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.log('No image generated, returning fallback');
      const fallbackSvg = generateFallbackAvatar(safeInitials, safeFullName);
      return new Response(JSON.stringify({ 
        success: true, 
        avatarUrl: fallbackSvg,
        type: 'svg'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      avatarUrl: imageData,
      type: 'base64'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating avatar:', error);
    
    const fallbackSvg = generateFallbackAvatar('U', null);
    return new Response(JSON.stringify({ 
      success: true, 
      avatarUrl: fallbackSvg,
      type: 'svg',
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackAvatar(initials: string, fullName: string | null): string {
  const safeInitials = initials.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'U';
  const colorIndex = fullName ? fullName.charCodeAt(0) % 6 : 0;
  const colors = [
    { bg1: '#fce4ec', bg2: '#f8bbd9', text: '#c2185b' },
    { bg1: '#e8eaf6', bg2: '#c5cae9', text: '#3f51b5' },
    { bg1: '#e0f2f1', bg2: '#b2dfdb', text: '#00897b' },
    { bg1: '#fff8e1', bg2: '#ffe082', text: '#f57c00' },
    { bg1: '#fce4ec', bg2: '#f48fb1', text: '#ad1457' },
    { bg1: '#e3f2fd', bg2: '#90caf9', text: '#1565c0' },
  ];
  const color = colors[colorIndex];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.bg1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.bg2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#grad)"/>
      <text x="100" y="115" font-family="serif" font-size="72" font-weight="600" fill="${color.text}" text-anchor="middle">${safeInitials}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
