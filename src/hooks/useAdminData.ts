import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for admin data
export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  link: string | null;
  button_text: string | null;
  position: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  product_count: number;
}

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number | null;
  images: string[];
  category_id: string | null;
  material: string | null;
  weight: string | null;
  dimensions: string | null;
  sku: string | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  rating: number | null;
  reviews_count: number | null;
  tags: string[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  product_ids: string[];
}

export interface CountdownTimer {
  id: string;
  title: string;
  subtitle: string | null;
  end_time: string;
  link: string | null;
  is_active: boolean;
  position: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  replied_at: string | null;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, any>;
}

// Hooks for fetching data
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category');
      if (error) throw error;
      return data as SiteSetting[];
    },
  });
};

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Banner[];
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useDBProducts = () => {
  return useQuery({
    queryKey: ['db-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DBProduct[];
    },
  });
};

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Collection[];
    },
  });
};

export const useCountdownTimers = () => {
  return useQuery({
    queryKey: ['countdown-timers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countdown_timers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CountdownTimer[];
    },
  });
};

export const useContactMessages = () => {
  return useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContactMessage[];
    },
  });
};

export const useHomepageSections = () => {
  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as HomepageSection[];
    },
  });
};

// Mutation hooks
export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: any }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update setting: ' + error.message);
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Banner> }) => {
      const { error } = await supabase
        .from('banners')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update banner: ' + error.message);
    },
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Banner, 'id'>) => {
      const { error } = await supabase
        .from('banners')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create banner: ' + error.message);
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete banner: ' + error.message);
    },
  });
};

export const useUpdateHomepageSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HomepageSection> }) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast.success('Section updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update section: ' + error.message);
    },
  });
};

export const useUpdateContactMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status, replied_at: status === 'replied' ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast.success('Message status updated');
    },
    onError: (error) => {
      toast.error('Failed to update message: ' + error.message);
    },
  });
};

export const useUpdateTimer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CountdownTimer> }) => {
      const { error } = await supabase
        .from('countdown_timers')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdown-timers'] });
      toast.success('Timer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update timer: ' + error.message);
    },
  });
};

export const useCreateTimer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<CountdownTimer, 'id'>) => {
      const { error } = await supabase
        .from('countdown_timers')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdown-timers'] });
      toast.success('Timer created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create timer: ' + error.message);
    },
  });
};

export const useDeleteTimer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('countdown_timers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdown-timers'] });
      toast.success('Timer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete timer: ' + error.message);
    },
  });
};
