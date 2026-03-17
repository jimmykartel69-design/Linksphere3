/**
 * API Route - User Purchases
 * Get purchase history for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { buildOrderNumber } from '@/lib/order'

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || undefined

    // Get purchases for the user
    let query = supabase
      .from('purchases')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (sessionId) {
      query = query.eq('stripe_session_id', sessionId).limit(1)
    }

    const { data: purchases, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mappedPurchases = (purchases || []).map((purchase) => ({
      ...purchase,
      order_number: buildOrderNumber(purchase.id, purchase.purchased_at || purchase.created_at),
    }))

    let purchasedSlots: number[] = []
    if (sessionId && mappedPurchases.length === 1) {
      const purchase = mappedPurchases[0]
      const purchasedAt = new Date(purchase.purchased_at || purchase.created_at)
      const start = new Date(purchasedAt.getTime() - 2 * 60 * 1000).toISOString()
      const end = new Date(purchasedAt.getTime() + 2 * 60 * 1000).toISOString()

      const { data: slots } = await supabase
        .from('slots')
        .select('slot_number')
        .eq('owner_id', authUser.id)
        .eq('status', 'SOLD')
        .gte('purchased_at', start)
        .lte('purchased_at', end)
        .order('slot_number', { ascending: true })
        .limit(Math.max(1, purchase.pack_size || 1))

      purchasedSlots = (slots || []).map((slot) => slot.slot_number)
    }

    return NextResponse.json({
      purchases: mappedPurchases,
      purchasedSlots,
    })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
