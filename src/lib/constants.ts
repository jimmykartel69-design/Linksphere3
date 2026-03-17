/**
 * LinkSphere - Application Constants
 * Central configuration for the platform
 */

// ============================================================================
// SLOT CONFIGURATION
// ============================================================================

/** Total number of slots on the sphere */
export const TOTAL_SLOTS = 1_000_000

/** Base price per slot in EUR */
export const BASE_SLOT_PRICE_EUR = 1

/** Currency for transactions */
export const DEFAULT_CURRENCY = 'EUR'

/** Supported currencies */
export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP'] as const

/** Slot reservation duration in minutes */
export const RESERVATION_DURATION_MINUTES = 30

/** Maximum slots a user can purchase in one transaction */
export const MAX_SLOTS_PER_TRANSACTION = 100

/** Minimum slots for bulk discount */
export const BULK_DISCOUNT_THRESHOLD = 10

/** Bulk discount percentage */
export const BULK_DISCOUNT_PERCENT = 10

// ============================================================================
// 3D RENDERING
// ============================================================================

/** Sphere radius in 3D units */
export const SPHERE_RADIUS = 100

/** Maximum zoom level */
export const MAX_ZOOM = 50

/** Minimum zoom level (distance from sphere) */
export const MIN_ZOOM = 150

/** Default camera distance */
export const DEFAULT_CAMERA_DISTANCE = 200

/** LOD distance thresholds */
export const LOD_THRESHOLDS = {
  cluster: 150,    // Show as clusters
  instanced: 100,  // Show as instanced meshes
  detailed: 50,    // Show individual slot details
} as const

/** Maximum instances to render at once */
export const MAX_VISIBLE_INSTANCES = 50000

/** Cluster size for distant rendering */
export const CLUSTER_SIZE = 1000

/** Animation duration for camera transitions (ms) */
export const CAMERA_TRANSITION_DURATION = 1000

// ============================================================================
// PAGINATION
// ============================================================================

/** Default page size for lists */
export const DEFAULT_PAGE_SIZE = 20

/** Maximum page size */
export const MAX_PAGE_SIZE = 100

/** Slot list page size for 3D explorer */
export const EXPLORER_PAGE_SIZE = 50

// ============================================================================
// FILE UPLOADS
// ============================================================================

/** Maximum logo file size in bytes (500KB) */
export const MAX_LOGO_SIZE = 500 * 1024

/** Maximum banner file size in bytes (2MB) */
export const MAX_BANNER_SIZE = 2 * 1024 * 1024

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

/** Logo dimensions */
export const LOGO_DIMENSIONS = {
  width: 200,
  height: 200,
} as const

/** Banner dimensions */
export const BANNER_DIMENSIONS = {
  width: 1200,
  height: 630,
} as const

// ============================================================================
// VALIDATION
// ============================================================================

/** Maximum title length */
export const MAX_TITLE_LENGTH = 50

/** Maximum description length */
export const MAX_DESCRIPTION_LENGTH = 200

/** Maximum URL length */
export const MAX_URL_LENGTH = 500

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 8

/** Maximum password length */
export const MAX_PASSWORD_LENGTH = 128

// ============================================================================
// SEO
// ============================================================================

/** Site name */
export const SITE_NAME = 'LinkSphere'

/** Site tagline */
export const SITE_TAGLINE = 'Own your place in the digital universe'

/** Default meta description */
export const DEFAULT_META_DESCRIPTION = 
  'LinkSphere is a digital visibility platform where you can own your place in the digital universe. Purchase sponsored slots on our interactive 3D sphere.'

/** Twitter handle */
export const TWITTER_HANDLE = '@linksphere'

/** Site URL (should be set via environment) */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://linksphere.space'

// ============================================================================
// LOCALIZATION
// ============================================================================

/** Supported locales */
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de'] as const

/** Default locale */
export const DEFAULT_LOCALE = 'en'

/** Locale names */
export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
}

// ============================================================================
// CACHE
// ============================================================================

/** Cache time for global stats (seconds) */
export const STATS_CACHE_TTL = 60

/** Cache time for category list (seconds) */
export const CATEGORIES_CACHE_TTL = 3600

/** Cache time for slot data (seconds) */
export const SLOT_CACHE_TTL = 300

// ============================================================================
// ANALYTICS
// ============================================================================

/** Analytics retention period in days */
export const ANALYTICS_RETENTION_DAYS = 365

/** Rate limit for analytics events per minute per IP */
export const ANALYTICS_RATE_LIMIT = 60

// ============================================================================
// STRIPE
// ============================================================================

/** Stripe success URL path */
export const STRIPE_SUCCESS_PATH = '/checkout/success'

/** Stripe cancel URL path */
export const STRIPE_CANCEL_PATH = '/checkout/cancel'

/** Stripe Payment Links for each pack */
export const STRIPE_PAYMENT_LINKS = {
  1: 'https://buy.stripe.com/7sY14p6HW2WT5n88Mlcwg00',
  10: 'https://buy.stripe.com/aFafZj6HW6952aW0fPcwg01',
  50: 'https://buy.stripe.com/28EaEZgiwdBxeXI4w5cwg02',
} as const

/** Get Stripe payment link for a pack size */
export function getStripePaymentLink(packSize: number): string | undefined {
  return STRIPE_PAYMENT_LINKS[packSize as keyof typeof STRIPE_PAYMENT_LINKS]
}

// ============================================================================
// UI
// ============================================================================

/** Toast notification duration (ms) */
export const TOAST_DURATION = 5000

/** Debounce delay for search (ms) */
export const SEARCH_DEBOUNCE_MS = 300

/** Mobile breakpoint in pixels */
export const MOBILE_BREAKPOINT = 768

/** Reduced motion preference media query */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// ============================================================================
// SLOT STATUS COLORS
// ============================================================================

/** Colors for slot status visualization */
export const SLOT_STATUS_COLORS = {
  AVAILABLE: '#22c55e', // green
  RESERVED: '#f59e0b',  // amber
  SOLD: '#3b82f6',      // blue
  DISABLED: '#6b7280',  // gray
} as const

// ============================================================================
// PACK CONFIGURATIONS
// ============================================================================

/** Pack pricing and features */
export const PACK_CONFIGS = {
  1: {
    slots: 1,
    price: 1,
    originalPrice: 1,
    discount: 0,
    name: 'Slot Unique',
    description: 'Idéal pour découvrir LinkSphere',
    features: ['1 emplacement', 'Propriété à vie', 'Analytics de base', 'Support email'],
  },
  10: {
    slots: 10,
    price: 9,
    originalPrice: 10,
    discount: 10,
    name: 'Pack 10 Slots',
    description: '10% de réduction - Pour les entrepreneurs',
    features: ['10 emplacements', 'Propriété à vie', 'Analytics détaillés', 'Badge Multi-Propriétaire', 'Support prioritaire'],
  },
  50: {
    slots: 50,
    price: 40,
    originalPrice: 50,
    discount: 20,
    name: 'Pack 50 Slots',
    description: '20% de réduction - Pour les entreprises',
    features: ['50 emplacements', 'Propriété à vie', 'Analytics avancés', 'Badge Investisseur', 'Bannière personnalisée', 'Support VIP'],
  },
  100: {
    slots: 100,
    price: 75,
    originalPrice: 100,
    discount: 25,
    name: 'Pack 100 Slots',
    description: '25% de réduction - Solution enterprise',
    features: ['100 emplacements', 'Propriété à vie', 'Analytics Pro', 'Badge Enterprise', 'API Access', 'Account Manager'],
  },
} as const

/** Get pack config by slots count */
export function getPackConfig(slots: number) {
  if (slots >= 100) return PACK_CONFIGS[100]
  if (slots >= 50) return PACK_CONFIGS[50]
  if (slots >= 10) return PACK_CONFIGS[10]
  return PACK_CONFIGS[1]
}

// ============================================================================
// USER BADGES
// ============================================================================

/** User badge configuration */
export const USER_BADGES = {
  NONE: {
    name: 'Nouveau',
    color: '#6b7280',
    icon: '🌟',
    minSlots: 0,
    maxSlots: 0,
  },
  OWNER: {
    name: 'Propriétaire',
    color: '#22c55e',
    icon: '📍',
    minSlots: 1,
    maxSlots: 9,
  },
  MULTI_OWNER: {
    name: 'Multi-Propriétaire',
    color: '#3b82f6',
    icon: '🏆',
    minSlots: 10,
    maxSlots: 49,
  },
  INVESTOR: {
    name: 'Investisseur',
    color: '#f59e0b',
    icon: '💎',
    minSlots: 50,
    maxSlots: 99,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    color: '#8b5cf6',
    icon: '👑',
    minSlots: 100,
    maxSlots: Infinity,
  },
} as const

/** Get badge from slot count */
export function getBadgeFromSlotCount(slots: number): keyof typeof USER_BADGES {
  if (slots >= 100) return 'ENTERPRISE'
  if (slots >= 50) return 'INVESTOR'
  if (slots >= 10) return 'MULTI_OWNER'
  if (slots >= 1) return 'OWNER'
  return 'NONE'
}

// ============================================================================
// CATEGORIES
// ============================================================================

/** Category configurations */
export const CATEGORIES = [
  { id: 'technology', name: 'Technology', icon: '💻', color: '#3b82f6' },
  { id: 'business', name: 'Business', icon: '💼', color: '#6366f1' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: '#ec4899' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#8b5cf6' },
  { id: 'education', name: 'Education', icon: '📚', color: '#14b8a6' },
  { id: 'health', name: 'Health & Wellness', icon: '🏃', color: '#22c55e' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#f59e0b' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#0ea5e9' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6b7280' },
] as const
