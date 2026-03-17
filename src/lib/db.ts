/**
 * LinkSphere - Database Client
 * Supabase database client for server-side operations
 */

import { getSupabaseServerClient } from './supabase/server'

// Re-export Supabase client getter
export { getSupabaseServerClient }

// Export types
export type { Database, Tables, InsertTables, UpdateTables } from './supabase/types'

/**
 * Get database client
 * This is an async function that returns the Supabase client
 */
export async function getDb() {
  return await getSupabaseServerClient()
}
