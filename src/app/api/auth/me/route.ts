/**
 * API Route - Current User
 * Get current authenticated user from Supabase Auth
 */

import { NextResponse } from 'next/server'
import { getAuthUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { USER_BADGES } from '@/lib/constants'

export async function GET() {
  try {
    // Get the current authenticated user from Supabase Auth
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      )
    }

    // Get user profile from profiles table (or use auth metadata)
    const supabase = await getSupabaseServerClient()
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { count, error: slotCountError } = await supabase
      .from('slots')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', authUser.id)

    if (slotCountError) {
      return NextResponse.json({ error: slotCountError.message }, { status: 500 })
    }
    const slotCount = count || 0

    // Determine badge based on slot count
    let badge = 'NONE'
    if (slotCount >= 50) badge = 'ENTERPRISE'
    else if (slotCount >= 20) badge = 'INVESTOR'
    else if (slotCount >= 2) badge = 'MULTI_OWNER'
    else if (slotCount >= 1) badge = 'OWNER'

    // Get badge info
    const badgeInfo = USER_BADGES[badge as keyof typeof USER_BADGES]

    // Merge auth user with profile data
    const user = {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
      avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      role: profile?.role || 'USER',
      badge: profile?.badge || badge,
      locale: profile?.locale || 'en',
      slotCount,
      badgeInfo: badgeInfo ? {
        name: badgeInfo.name,
        icon: badgeInfo.icon,
        color: badgeInfo.color,
      } : null,
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
