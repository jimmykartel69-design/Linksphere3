/**
 * LinkSphere - Authentication Utilities
 * Helper functions for authentication using Supabase Auth
 */

import { getSupabaseServerClient } from './supabase/server'

/**
 * Get user profile from profiles table
 */
export async function getUserProfile(userId: string) {
  const supabase = await getSupabaseServerClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, badge, locale, timezone, created_at')
    .eq('id', userId)
    .single()

  if (error || !profile) return null

  // Get slot count
  let slotCount = 0
  try {
    const { count } = await supabase
      .from('slots')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
    slotCount = count || 0
  } catch {
    // Table doesn't exist
  }

  // Get total analytics
  let totalViews = 0
  let totalClicks = 0
  try {
    const { data: slots } = await supabase
      .from('slots')
      .select('view_count, click_count')
      .eq('owner_id', userId)

    totalViews = slots?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0
    totalClicks = slots?.reduce((sum, s) => sum + (s.click_count || 0), 0) || 0
  } catch {
    // Table doesn't exist
  }

  return {
    ...profile,
    avatarUrl: profile.avatar_url,
    createdAt: profile.created_at,
    slotCount,
    totalViews,
    totalClicks,
  }
}

/**
 * Check if user owns a slot
 */
export async function userOwnsSlot(userId: string, slotId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
  try {
    const { data: slot } = await supabase
      .from('slots')
      .select('owner_id')
      .eq('id', slotId)
      .single()
    
    return slot?.owner_id === userId
  } catch {
    return false
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = ['USER', 'MODERATOR', 'ADMIN']
  const userLevel = roleHierarchy.indexOf(userRole)
  const requiredLevel = roleHierarchy.indexOf(requiredRole)
  
  return userLevel >= requiredLevel
}

/**
 * Update user badge based on slot ownership
 */
export async function updateUserBadge(userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()
  
  // Get slot count
  const { count } = await supabase
    .from('slots')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)

  const slotCount = count || 0

  // Determine badge
  let badge = 'NONE'
  if (slotCount >= 50) badge = 'ENTERPRISE'
  else if (slotCount >= 20) badge = 'INVESTOR'
  else if (slotCount >= 2) badge = 'MULTI_OWNER'
  else if (slotCount >= 1) badge = 'OWNER'

  // Update profile
  await supabase
    .from('profiles')
    .update({ badge })
    .eq('id', userId)
}
