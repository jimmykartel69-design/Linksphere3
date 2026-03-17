/**
 * Slot-related type definitions
 */

export type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'DISABLED'
export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'

/**
 * Slot position on the 3D sphere (spherical coordinates)
 */
export interface SlotPosition {
  slotNumber: number
  theta: number // Horizontal angle (0 to 2π)
  phi: number   // Vertical angle (0 to π)
}

/**
 * Full slot data from database
 */
export interface Slot {
  id: string
  slotNumber: number
  status: SlotStatus
  theta: number
  phi: number
  title: string | null
  description: string | null
  targetUrl: string | null
  logoUrl: string | null
  bannerUrl: string | null
  categoryId: string | null
  countryId: string | null
  languageId: string | null
  ownerId: string | null
  purchasedAt: Date | null
  purchasePrice: number | null
  moderationStatus: ModerationStatus
  moderationNotes: string | null
  viewCount: number
  clickCount: number
  createdAt: Date
  updatedAt: Date
  category?: Category | null
  country?: Country | null
  language?: Language | null
  owner?: SlotOwner | null
}

/**
 * Category data
 */
export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  isActive: boolean
  _count?: { slots: number }
}

/**
 * Language data
 */
export interface Language {
  id: string
  code: string
  name: string
  nativeName: string | null
  isActive: boolean
  isDefault: boolean
}

/**
 * Country data
 */
export interface Country {
  id: string
  code: string
  name: string
  continent: string | null
  flagEmoji: string | null
  isActive: boolean
}

/**
 * User data (simplified for slot relations)
 */
export interface SlotOwner {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
}

/**
 * Slot with computed fields for display
 */
export interface SlotWithDisplay extends Slot {
  isAvailable: boolean
  isOwned: boolean
  displayTitle: string
  displayColor: string
}

/**
 * Slot search filters
 */
export interface SlotFilters {
  status?: SlotStatus[]
  categoryId?: string
  countryId?: string
  languageId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minSlotNumber?: number
  maxSlotNumber?: number
}

/**
 * Slot creation/update payload
 */
export interface SlotPayload {
  title: string
  description?: string
  targetUrl?: string
  logoUrl?: string
  bannerUrl?: string
  categoryId?: string
  countryId?: string
  languageId?: string
}

/**
 * Slot reservation data
 */
export interface SlotReservation {
  id: string
  slotId: string
  slotNumber: number
  expiresAt: Date
  status: string
}

/**
 * 3D visualization slot data (optimized for rendering)
 */
export interface Slot3DData {
  id: string
  n: number        // slot number
  t: number        // theta
  p: number        // phi
  s: number        // status (0=available, 1=reserved, 2=sold, 3=disabled)
  c?: string       // color override
}

/**
 * Slot cluster for LOD rendering
 */
export interface SlotCluster {
  centerTheta: number
  centerPhi: number
  count: number
  statusDistribution: Record<number, number>
  bounds: {
    minTheta: number
    maxTheta: number
    minPhi: number
    maxPhi: number
  }
}
