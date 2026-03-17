/**
 * LinkSphere - Supabase Server Client
 * Server-side Supabase client for API routes and server components
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_CONFIG } from '@/lib/config'

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user from Supabase Auth
 */
export async function getAuthUser() {
  const supabase = await getSupabaseServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Sign up a new user with Supabase Auth
 */
export async function signUpUser(email: string, password: string, metadata?: { name?: string }) {
  const supabase = await getSupabaseServerClient()
  
  // Use production URL for email confirmation redirect
  const siteUrl = SUPABASE_CONFIG.siteUrl
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })
  
  if (error) {
    return { user: null, session: null, error }
  }
  
  return { 
    user: data.user, 
    session: data.session, 
    error: null 
  }
}

/**
 * Sign in an existing user with Supabase Auth
 */
export async function signInUser(email: string, password: string) {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { user: null, session: null, error }
  }
  
  return { 
    user: data.user, 
    session: data.session, 
    error: null 
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  const supabase = await getSupabaseServerClient()
  
  const { error } = await supabase.auth.signOut()
  
  return { error }
}
