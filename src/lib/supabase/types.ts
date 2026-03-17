/**
 * LinkSphere - Supabase Database Types
 * TypeScript types for Supabase database
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          role: 'USER' | 'ADMIN' | 'MODERATOR'
          badge: 'NONE' | 'OWNER' | 'MULTI_OWNER' | 'INVESTOR' | 'ENTERPRISE'
          locale: string
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'USER' | 'ADMIN' | 'MODERATOR'
          badge?: 'NONE' | 'OWNER' | 'MULTI_OWNER' | 'INVESTOR' | 'ENTERPRISE'
          locale?: string
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'USER' | 'ADMIN' | 'MODERATOR'
          badge?: 'NONE' | 'OWNER' | 'MULTI_OWNER' | 'INVESTOR' | 'ENTERPRISE'
          locale?: string
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      slots: {
        Row: {
          id: string
          slot_number: number
          status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DISABLED'
          theta: number
          phi: number
          title: string | null
          description: string | null
          target_url: string | null
          logo_url: string | null
          banner_url: string | null
          category_id: string | null
          owner_id: string | null
          purchased_at: string | null
          purchase_price: number | null
          moderation_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
          moderation_notes: string | null
          view_count: number
          click_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_number: number
          status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DISABLED'
          theta: number
          phi: number
          title?: string | null
          description?: string | null
          target_url?: string | null
          logo_url?: string | null
          banner_url?: string | null
          category_id?: string | null
          owner_id?: string | null
          purchased_at?: string | null
          purchase_price?: number | null
          moderation_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
          moderation_notes?: string | null
          view_count?: number
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_number?: number
          status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DISABLED'
          theta?: number
          phi?: number
          title?: string | null
          description?: string | null
          target_url?: string | null
          logo_url?: string | null
          banner_url?: string | null
          category_id?: string | null
          owner_id?: string | null
          purchased_at?: string | null
          purchase_price?: number | null
          moderation_status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
          moderation_notes?: string | null
          view_count?: number
          click_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          slot_id: string | null
          user_id: string
          pack_size: number
          pack_name: string | null
          amount: number
          original_amount: number | null
          discount_percent: number
          currency: string
          stripe_session_id: string | null
          stripe_payment_id: string | null
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          purchased_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_id?: string | null
          user_id: string
          pack_size?: number
          pack_name?: string | null
          amount: number
          original_amount?: number | null
          discount_percent?: number
          currency?: string
          stripe_session_id?: string | null
          stripe_payment_id?: string | null
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          purchased_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_id?: string | null
          user_id?: string
          pack_size?: number
          pack_name?: string | null
          amount?: number
          original_amount?: number | null
          discount_percent?: number
          currency?: string
          stripe_session_id?: string | null
          stripe_payment_id?: string | null
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
          purchased_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      global_stats: {
        Row: {
          id: string
          total_slots: number
          available_slots: number
          sold_slots: number
          reserved_slots: number
          total_revenue: number
          total_users: number
          total_purchases: number
          updated_at: string
        }
        Insert: {
          id?: string
          total_slots?: number
          available_slots?: number
          sold_slots?: number
          reserved_slots?: number
          total_revenue?: number
          total_users?: number
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          id?: string
          total_slots?: number
          available_slots?: number
          sold_slots?: number
          reserved_slots?: number
          total_revenue?: number
          total_users?: number
          total_purchases?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'USER' | 'ADMIN' | 'MODERATOR'
      user_badge: 'NONE' | 'OWNER' | 'MULTI_OWNER' | 'INVESTOR' | 'ENTERPRISE'
      slot_status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DISABLED'
      moderation_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
      payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
