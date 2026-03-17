/**
 * LinkSphere - Database Types
 * TypeScript types derived from Supabase schema
 */

// Profile types
export interface Profile {
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

export interface Category {
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

export interface Slot {
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

export interface Purchase {
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

export interface GlobalStats {
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

// Insert types (for creating new records)
export type NewProfile = Omit<Profile, 'created_at' | 'updated_at'>
export type NewSlot = Omit<Slot, 'id' | 'created_at' | 'updated_at'>
export type NewPurchase = Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'purchased_at'>

// Update types
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
export type SlotUpdate = Partial<Omit<Slot, 'id' | 'created_at' | 'updated_at'>>
export type PurchaseUpdate = Partial<Omit<Purchase, 'id' | 'created_at' | 'updated_at'>>
