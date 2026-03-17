/**
 * Runtime environment validation helpers.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optionalEnv(name: string, fallback: string = ''): string {
  return process.env[name] || fallback
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_SITE_URL: requireEnv('NEXT_PUBLIC_SITE_URL'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_SECRET_KEY: optionalEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: optionalEnv('STRIPE_WEBHOOK_SECRET'),
  GOOGLE_SITE_VERIFICATION: optionalEnv('GOOGLE_SITE_VERIFICATION'),
  SENTRY_DSN: optionalEnv('SENTRY_DSN'),
} as const

