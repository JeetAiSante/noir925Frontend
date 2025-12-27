export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string | null
          city: string
          country: string
          created_at: string | null
          full_name: string
          id: string
          is_default: boolean | null
          phone: string
          postal_code: string
          state: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string | null
          city: string
          country?: string
          created_at?: string | null
          full_name: string
          id?: string
          is_default?: boolean | null
          phone: string
          postal_code: string
          state: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string | null
          city?: string
          country?: string
          created_at?: string | null
          full_name?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          postal_code?: string
          state?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          button_text: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          is_video: boolean | null
          link: string | null
          position: string
          sort_order: number
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          is_video?: boolean | null
          link?: string | null
          position?: string
          sort_order?: number
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          is_video?: boolean | null
          link?: string | null
          position?: string
          sort_order?: number
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          parent_id: string | null
          product_count: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          parent_id?: string | null
          product_count?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          parent_id?: string | null
          product_count?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          product_ids: Json | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          product_ids?: Json | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          product_ids?: Json | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      countdown_timers: {
        Row: {
          accent_color: string | null
          bg_color: string | null
          button_text: string | null
          created_at: string
          end_time: string
          icon_type: string | null
          id: string
          is_active: boolean
          link: string | null
          position: string
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          bg_color?: string | null
          button_text?: string | null
          created_at?: string
          end_time: string
          icon_type?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          position?: string
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          bg_color?: string | null
          button_text?: string | null
          created_at?: string
          end_time?: string
          icon_type?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          position?: string
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_categories: Json | null
          applicable_products: Json | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_value: number | null
          name: string
          start_date: string | null
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_value?: number | null
          name: string
          start_date?: string | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_categories?: Json | null
          applicable_products?: Json | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_value?: number | null
          name?: string
          start_date?: string | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      currency_settings: {
        Row: {
          country_codes: string[]
          created_at: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          exchange_rate: number
          id: string
          is_active: boolean | null
          is_default: boolean | null
          updated_at: string
        }
        Insert: {
          country_codes?: string[]
          created_at?: string
          currency_code: string
          currency_name: string
          currency_symbol: string
          exchange_rate?: number
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          updated_at?: string
        }
        Update: {
          country_codes?: string[]
          created_at?: string
          currency_code?: string
          currency_name?: string
          currency_symbol?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      feature_toggles: {
        Row: {
          created_at: string
          description: string | null
          feature_key: string
          feature_name: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_key: string
          feature_name: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      festival_themes: {
        Row: {
          accent_color: string
          background_color: string
          banner_image: string | null
          created_at: string
          discount_percent: number | null
          end_date: string | null
          floating_banner_text: string | null
          id: string
          is_active: boolean
          logo_overlay: string | null
          name: string
          primary_color: string
          secondary_color: string
          show_floating_banner: boolean | null
          slug: string
          special_offer: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          banner_image?: string | null
          created_at?: string
          discount_percent?: number | null
          end_date?: string | null
          floating_banner_text?: string | null
          id?: string
          is_active?: boolean
          logo_overlay?: string | null
          name: string
          primary_color?: string
          secondary_color?: string
          show_floating_banner?: boolean | null
          slug: string
          special_offer?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          banner_image?: string | null
          created_at?: string
          discount_percent?: number | null
          end_date?: string | null
          floating_banner_text?: string | null
          id?: string
          is_active?: boolean
          logo_overlay?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          show_floating_banner?: boolean | null
          slug?: string
          special_offer?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gift_card_denominations: {
        Row: {
          amount: number
          bonus_amount: number
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          amount: number
          bonus_amount?: number
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          bonus_amount?: number
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          section_key: string
          section_name: string
          settings: Json | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          section_key: string
          section_name: string
          settings?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          section_key?: string
          section_name?: string
          settings?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inventory_settings: {
        Row: {
          created_at: string
          critical_stock_threshold: number
          enable_low_stock_alerts: boolean
          enable_reorder_notifications: boolean
          id: string
          low_stock_threshold: number
          reorder_email: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          critical_stock_threshold?: number
          enable_low_stock_alerts?: boolean
          enable_reorder_notifications?: boolean
          id?: string
          low_stock_threshold?: number
          reorder_email?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          critical_stock_threshold?: number
          enable_low_stock_alerts?: boolean
          enable_reorder_notifications?: boolean
          id?: string
          low_stock_threshold?: number
          reorder_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_settings: {
        Row: {
          company_logo: string | null
          company_name: string | null
          company_signature: string | null
          created_at: string | null
          footer_text: string | null
          id: string
          invoice_prefix: string | null
          terms_text: string | null
          updated_at: string | null
        }
        Insert: {
          company_logo?: string | null
          company_name?: string | null
          company_signature?: string | null
          created_at?: string | null
          footer_text?: string | null
          id?: string
          invoice_prefix?: string | null
          terms_text?: string | null
          updated_at?: string | null
        }
        Update: {
          company_logo?: string | null
          company_name?: string | null
          company_signature?: string | null
          created_at?: string | null
          footer_text?: string | null
          id?: string
          invoice_prefix?: string | null
          terms_text?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          max_discount_percent: number
          min_points_to_redeem: number
          points_per_rupee: number
          points_value_per_rupee: number
          updated_at: string
          welcome_bonus_points: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          max_discount_percent?: number
          min_points_to_redeem?: number
          points_per_rupee?: number
          points_value_per_rupee?: number
          updated_at?: string
          welcome_bonus_points?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          max_discount_percent?: number
          min_points_to_redeem?: number
          points_per_rupee?: number
          points_value_per_rupee?: number
          updated_at?: string
          welcome_bonus_points?: number
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      lucky_discount_claims: {
        Row: {
          created_at: string
          discount_code: string
          discount_id: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          login_time: string
          lucky_number: number
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_code: string
          discount_id?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          login_time: string
          lucky_number: number
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_code?: string
          discount_id?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          login_time?: string
          lucky_number?: number
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lucky_discount_claims_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "lucky_number_discounts"
            referencedColumns: ["id"]
          },
        ]
      }
      lucky_number_discounts: {
        Row: {
          created_at: string
          description: string | null
          discount_code: string | null
          discount_percent: number
          id: string
          is_active: boolean
          login_time_end: string | null
          login_time_start: string | null
          lucky_numbers: number[]
          max_discount_amount: number | null
          min_order_value: number | null
          name: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_code?: string | null
          discount_percent?: number
          id?: string
          is_active?: boolean
          login_time_end?: string | null
          login_time_start?: string | null
          lucky_numbers?: number[]
          max_discount_amount?: number | null
          min_order_value?: number | null
          name: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_code?: string | null
          discount_percent?: number
          id?: string
          is_active?: boolean
          login_time_end?: string | null
          login_time_start?: string | null
          lucky_numbers?: number[]
          max_discount_amount?: number | null
          min_order_value?: number | null
          name?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
          variant: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          product_image?: string | null
          product_name: string
          quantity: number
          size?: string | null
          variant?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          discount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean
          meta_description: string | null
          meta_title: string | null
          page_key: string
          page_title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          page_key: string
          page_title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          page_key?: string
          page_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          is_featured: boolean | null
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number
          reviewer_avatar: string | null
          reviewer_name: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating: number
          reviewer_avatar?: string | null
          reviewer_name: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number
          reviewer_avatar?: string | null
          reviewer_name?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          discount_percent: number | null
          festival_id: string | null
          gender: string | null
          hover_image_index: number | null
          id: string
          images: Json
          is_active: boolean
          is_bestseller: boolean
          is_featured: boolean
          is_new: boolean
          is_trending: boolean
          material: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          reviews_count: number | null
          short_description: string | null
          sku: string | null
          slug: string
          stock_quantity: number
          tags: Json | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          discount_percent?: number | null
          festival_id?: string | null
          gender?: string | null
          hover_image_index?: number | null
          id?: string
          images?: Json
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_trending?: boolean
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          reviews_count?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number
          tags?: Json | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          discount_percent?: number | null
          festival_id?: string | null
          gender?: string | null
          hover_image_index?: number | null
          id?: string
          images?: Json
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_trending?: boolean
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number
          tags?: Json | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festival_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_contact: {
        Row: {
          address: string | null
          company_logo: string | null
          company_name: string | null
          company_signature: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          gst_number: string | null
          id: string
          instagram_url: string | null
          invoice_prefix: string | null
          phone: string | null
          twitter_url: string | null
          updated_at: string
          whatsapp: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_signature?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          gst_number?: string | null
          id?: string
          instagram_url?: string | null
          invoice_prefix?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_signature?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          gst_number?: string | null
          id?: string
          instagram_url?: string | null
          invoice_prefix?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sold_products: {
        Row: {
          created_at: string
          id: string
          is_removed: boolean
          product_id: string
          product_name: string
          product_slug: string
          remove_after: string
          sold_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_removed?: boolean
          product_id: string
          product_name: string
          product_slug: string
          remove_after?: string
          sold_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_removed?: boolean
          product_id?: string
          product_name?: string
          product_slug?: string
          remove_after?: string
          sold_at?: string
        }
        Relationships: []
      }
      spin_wheel_history: {
        Row: {
          coupon_code: string | null
          created_at: string
          id: string
          is_redeemed: boolean | null
          prize_type: string
          prize_value: string
          redeemed_at: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          id?: string
          is_redeemed?: boolean | null
          prize_type: string
          prize_value: string
          redeemed_at?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          id?: string
          is_redeemed?: boolean | null
          prize_type?: string
          prize_value?: string
          redeemed_at?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      spin_wheel_prizes: {
        Row: {
          color: string
          created_at: string
          discount_percent: number | null
          id: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
          value: string
          weight: number
        }
        Insert: {
          color?: string
          created_at?: string
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
          value: string
          weight?: number
        }
        Update: {
          color?: string
          created_at?: string
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
          weight?: number
        }
        Relationships: []
      }
      spin_wheel_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          show_on_pages: string[] | null
          spins_per_day: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          show_on_pages?: string[] | null
          spins_per_day?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          show_on_pages?: string[] | null
          spins_per_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      tax_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          is_inclusive: boolean | null
          tax_name: string
          tax_percent: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          is_inclusive?: boolean | null
          tax_name?: string
          tax_percent?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          is_inclusive?: boolean | null
          tax_name?: string
          tax_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_loyalty_points: {
        Row: {
          available_points: number | null
          created_at: string
          id: string
          redeemed_points: number
          tier: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_points?: number | null
          created_at?: string
          id?: string
          redeemed_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_points?: number | null
          created_at?: string
          id?: string
          redeemed_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
