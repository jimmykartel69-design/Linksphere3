/**
 * API Route - Authentication
 * User logout endpoint using Supabase Auth
 */

import { NextResponse } from 'next/server'
import { signOutUser } from '@/lib/supabase/server'

/**
 * POST /api/auth/logout
 * Sign out the current user
 */
export async function POST() {
  try {
    const { error } = await signOutUser()
    
    if (error) {
      console.error('Supabase signout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
