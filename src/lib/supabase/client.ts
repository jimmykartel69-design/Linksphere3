/**
 * LinkSphere - Supabase Browser Client
 * Client-side Supabase client for browser usage
 */

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@/lib/config'

let client: ReturnType<typeof createBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    )
  }
  return client
}

// Export for convenience
export const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null
