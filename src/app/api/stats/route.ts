/**
 * API Route - Global Statistics
 * Returns platform statistics
 */

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { TOTAL_SLOTS } from '@/lib/constants'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Get non-slot counters from global stats (best effort)
    let { data: stats } = await supabase
      .from('global_stats')
      .select('*')
      .single()

    if (!stats) {
      const { data: newStats } = await supabase
        .from('global_stats')
        .insert({
          total_slots: TOTAL_SLOTS,
          available_slots: TOTAL_SLOTS,
          sold_slots: 0,
          reserved_slots: 0,
          total_revenue: 0,
          total_users: 0,
          total_purchases: 0,
        })
        .select()
        .single()
      stats = newStats
    }

    const [soldRes, reservedRes, disabledRes] = await Promise.all([
      supabase.from('slots').select('id', { head: true, count: 'exact' }).eq('status', 'SOLD'),
      supabase.from('slots').select('id', { head: true, count: 'exact' }).eq('status', 'RESERVED'),
      supabase.from('slots').select('id', { head: true, count: 'exact' }).eq('status', 'DISABLED'),
    ])

    const soldSlots = soldRes.count || 0
    const reservedSlots = reservedRes.count || 0
    const disabledSlots = disabledRes.count || 0
    const availableSlots = Math.max(0, TOTAL_SLOTS - soldSlots - reservedSlots - disabledSlots)
    const occupiedSlots = soldSlots + reservedSlots + disabledSlots

    return NextResponse.json({
      totalSlots: TOTAL_SLOTS,
      availableSlots,
      occupiedSlots,
      soldSlots,
      reservedSlots,
      disabledSlots,
      totalRevenue: stats?.total_revenue || 0,
      totalUsers: stats?.total_users || 0,
      totalPurchases: stats?.total_purchases || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return default stats on error
    return NextResponse.json({
      totalSlots: TOTAL_SLOTS,
      availableSlots: TOTAL_SLOTS,
      occupiedSlots: 0,
      soldSlots: 0,
      reservedSlots: 0,
      disabledSlots: 0,
      totalRevenue: 0,
      totalUsers: 0,
      totalPurchases: 0,
    })
  }
}
