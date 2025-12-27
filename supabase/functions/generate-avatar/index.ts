import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initials, fullName, style } = await req.json();
    
    if (!initials) {
      throw new Error('Initials are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, using fallback');
      const fallbackSvg = generateFallbackAvatar(initials, fullName);
      return new Response(JSON.stringify({ 
        success: true, 
        avatarUrl: fallbackSvg,
        type: 'svg'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a luxury avatar prompt
    const prompt = `Create a luxurious minimalist avatar design featuring the initials "${initials}" in an elegant serif font. The design should have a circular gradient background with subtle metallic shimmer effects, premium jewelry brand aesthetic, high-end boutique style with rose gold and champagne tones. Ultra high resolution, professional quality, suitable for a luxury silver jewelry brand profile picture. The initials should be prominently displayed in the center with artistic flourishes. Aspect ratio 1:1, circular avatar format.`;

    console.log('Generating avatar with Lovable AI');

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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Return fallback on error
      const fallbackSvg = generateFallbackAvatar(initials, fullName);
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
    console.log('AI response received');

    // Extract the generated image
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.log('No image generated, returning fallback');
      const fallbackSvg = generateFallbackAvatar(initials, fullName);
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
  // Generate color based on name
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
      <text x="100" y="115" font-family="serif" font-size="72" font-weight="600" fill="${color.text}" text-anchor="middle">${initials.toUpperCase().slice(0, 2)}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
