/**
 * LinkSphere - Validators
 * Zod schemas for form validation and API input
 */

import { z } from 'zod'
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_SLOTS_PER_TRANSACTION,
} from './constants'

// ============================================================================
// AUTH VALIDATORS
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password must be less than ${MAX_PASSWORD_LENGTH} characters`),
  confirmPassword: z.string(),
  name: z.string().min(1, 'Name is required').max(100).optional().or(z.literal('')),
  locale: z.string().length(2).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password must be less than ${MAX_PASSWORD_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// ============================================================================
// SLOT VALIDATORS
// ============================================================================

export const slotContentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .or(z.literal('')),
  targetUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().cuid().optional().or(z.literal('')),
  countryId: z.string().cuid().optional().or(z.literal('')),
  languageId: z.string().cuid().optional().or(z.literal('')),
})

export const slotPurchaseSchema = z.object({
  slotNumbers: z
    .array(z.number().int().positive())
    .min(1, 'At least one slot is required')
    .max(MAX_SLOTS_PER_TRANSACTION, `Maximum ${MAX_SLOTS_PER_TRANSACTION} slots per transaction`),
  autoAssign: z.boolean().optional(),
  quantity: z.number().int().positive().max(MAX_SLOTS_PER_TRANSACTION).optional(),
})

// ============================================================================
// SEARCH/FILTER VALIDATORS
// ============================================================================

export const slotSearchSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  status: z.enum(['available', 'sold', 'all']).optional(),
  minSlot: z.number().int().min(1).optional(),
  maxSlot: z.number().int().max(1000000).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

// ============================================================================
// USER VALIDATORS
// ============================================================================

export const userProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  locale: z.string().length(2).optional(),
  timezone: z.string().optional(),
})

export const userSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
})

// ============================================================================
// ADMIN VALIDATORS
// ============================================================================

export const adminSlotUpdateSchema = z.object({
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'DISABLED']).optional(),
  moderationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']).optional(),
  moderationNotes: z.string().max(1000).optional(),
})

export const adminUserUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(500).optional(),
})

export const reportSchema = z.object({
  slotId: z.string().cuid(),
  reason: z.string().min(10, 'Please provide more details').max(500),
  details: z.string().max(1000).optional(),
})

// ============================================================================
// CATEGORY VALIDATORS
// ============================================================================

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  sortOrder: z.number().int().optional(),
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type SlotContentInput = z.infer<typeof slotContentSchema>
export type SlotPurchaseInput = z.infer<typeof slotPurchaseSchema>
export type SlotSearchInput = z.infer<typeof slotSearchSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type AdminSlotUpdateInput = z.infer<typeof adminSlotUpdateSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type CategoryInput = z.infer<typeof categorySchema>
