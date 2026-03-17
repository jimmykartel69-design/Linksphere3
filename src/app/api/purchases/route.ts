/**
 * API Route - User Purchases
 * Get purchase history for the authenticated user
 */

import { NextResponse } from 'next/server'
import { getAuthUser, getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Get current authenticated user from Supabase Auth
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Supabase client
    const supabase = await getSupabaseServerClient()

    // Get purchases for the user
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ purchases: purchases || [] })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
