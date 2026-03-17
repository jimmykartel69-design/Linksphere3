/**
 * LinkSphere - Configuration
 * Runtime-safe configuration sourced from environment variables.
 */

import { env } from '@/lib/env'

export const SUPABASE_CONFIG = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
} as const

export const STRIPE_CONFIG = {
  publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
} as const
