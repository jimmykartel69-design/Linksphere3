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
    
    // Get or create global stats
    let { data: stats, error } = await supabase
      .from('global_stats')
      .select('*')
      .single()

    if (error || !stats) {
      // Create initial stats if not exists
      const { data: newStats, error: insertError } = await supabase
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

      if (insertError) {
        // Return default stats
        return NextResponse.json({
          totalSlots: TOTAL_SLOTS,
          availableSlots: TOTAL_SLOTS,
          soldSlots: 0,
          reservedSlots: 0,
          totalRevenue: 0,
          totalUsers: 0,
          totalPurchases: 0,
        })
      }

      stats = newStats
    }

    return NextResponse.json({
      totalSlots: stats.total_slots,
      availableSlots: stats.available_slots,
      soldSlots: stats.sold_slots,
      reservedSlots: stats.reserved_slots,
      totalRevenue: stats.total_revenue,
      totalUsers: stats.total_users || 0,
      totalPurchases: stats.total_purchases || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return default stats on error
    return NextResponse.json({
      totalSlots: TOTAL_SLOTS,
      availableSlots: TOTAL_SLOTS,
      soldSlots: 0,
      reservedSlots: 0,
      totalRevenue: 0,
      totalUsers: 0,
      totalPurchases: 0,
    })
  }
}
