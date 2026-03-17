/**
 * Runtime environment validation helpers.
 *
 * IMPORTANT: use static `process.env.X` access so Next.js can inline
 * NEXT_PUBLIC_* variables into client bundles.
 */

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

if (!NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}
if (!NEXT_PUBLIC_SITE_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SITE_URL')
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION || '',
  SENTRY_DSN: process.env.SENTRY_DSN || '',
} as const
