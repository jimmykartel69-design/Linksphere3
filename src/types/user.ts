/**
 * User-related type definitions
 */

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'

/**
 * Full user data from database
 */
export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: UserRole
  locale: string
  timezone: string | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * User profile (safe for client-side)
 */
export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: string
  locale: string
  timezone: string | null
  slotCount: number
  totalViews: number
  totalClicks: number
}

/**
 * User authentication payload
 */
export interface AuthPayload {
  email: string
  password: string
  name?: string
}

/**
 * User registration payload
 */
export interface RegisterPayload extends AuthPayload {
  confirmPassword: string
  locale?: string
}

/**
 * User settings update payload
 */
export interface UserSettingsPayload {
  name?: string
  avatarUrl?: string
  locale?: string
  timezone?: string
}

/**
 * Session data
 */
export interface Session {
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  expires: string
}

/**
 * Admin user with extended permissions
 */
export interface AdminUser extends User {
  permissions: AdminPermission[]
}

export type AdminPermission = 
  | 'moderate_slots'
  | 'moderate_users'
  | 'view_analytics'
  | 'manage_categories'
  | 'manage_settings'
  | 'view_reports'
  | 'handle_payments'
