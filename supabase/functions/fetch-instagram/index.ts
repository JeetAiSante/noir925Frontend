import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');
    const instagramUserId = Deno.env.get('INSTAGRAM_USER_ID');

    if (!accessToken || !instagramUserId) {
      // Return fallback data if credentials not configured
      return new Response(JSON.stringify({
        success: false,
        message: 'Instagram credentials not configured',
        fallback: true,
        posts: getFallbackPosts()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch media from Instagram Graph API
    const mediaUrl = `https://graph.instagram.com/${instagramUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count&access_token=${accessToken}&limit=6`;
    
    const response = await fetch(mediaUrl);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Instagram API error:', error);
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data
    const posts = data.data?.map((post: any) => ({
      id: post.id,
      image: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
      caption: post.caption || '',
      permalink: post.permalink,
      likes: post.like_count || 0,
      timestamp: post.timestamp,
    })) || [];

    return new Response(JSON.stringify({
      success: true,
      posts,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error fetching Instagram posts:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: true,
      posts: getFallbackPosts()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 with fallback data
    });
  }
});

function getFallbackPosts() {
  return [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
      likes: 234,
      caption: 'Celestial dreams ✨ #NOIR925',
      permalink: 'https://instagram.com',
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      likes: 189,
      caption: 'Blooming elegance 🌸',
      permalink: 'https://instagram.com',
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
      likes: 312,
      caption: 'Forever & always 💕',
      permalink: 'https://instagram.com',
    },
    {
      id: '4',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      likes: 267,
      caption: 'Statement pieces 🖤',
      permalink: 'https://instagram.com',
    },
    {
      id: '5',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      likes: 198,
      caption: 'Timeless classics ✨',
      permalink: 'https://instagram.com',
    },
    {
      id: '6',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop',
      likes: 423,
      caption: 'Delicate details 🦋',
      permalink: 'https://instagram.com',
    },
  ];
}