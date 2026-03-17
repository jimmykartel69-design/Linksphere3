/**
 * API Route - Planet Slot Visualization
 * Returns sampled slot statuses for ultra-fast 3D rendering.
 */

import { NextRequest, NextResponse } from 'next/server'
import { TOTAL_SLOTS } from '@/lib/constants'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const STATUS_CODE = {
  AVAILABLE: 0,
  RESERVED: 1,
  SOLD: 2,
  DISABLED: 3,
} as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedSample = Number(searchParams.get('sample') || '60000')
    const sample = Math.min(120000, Math.max(10000, Number.isFinite(requestedSample) ? requestedSample : 60000))
    const supabase = await getSupabaseServerClient()

    const [soldCountRes, reservedCountRes, disabledCountRes, nonAvailableRes] = await Promise.all([
      supabase.from('slots').select('id', { count: 'exact', head: true }).eq('status', 'SOLD'),
      supabase.from('slots').select('id', { count: 'exact', head: true }).eq('status', 'RESERVED'),
      supabase.from('slots').select('id', { count: 'exact', head: true }).eq('status', 'DISABLED'),
      supabase
        .from('slots')
        .select('slot_number,status')
        .in('status', ['SOLD', 'RESERVED', 'DISABLED'])
        .order('slot_number', { ascending: true })
        .range(0, Math.min(sample * 2, 120000) - 1),
    ])

    if (nonAvailableRes.error) {
      return NextResponse.json({ error: nonAvailableRes.error.message }, { status: 500 })
    }

    const statusByIndex = new Map<number, number>()
    for (const row of nonAvailableRes.data || []) {
      const slotNumber = Number(row.slot_number)
      const idx = Math.floor(((slotNumber - 1) / TOTAL_SLOTS) * sample)
      if (idx < 0 || idx >= sample) continue
      const nextCode = STATUS_CODE[row.status as keyof typeof STATUS_CODE] ?? STATUS_CODE.AVAILABLE
      const currentCode = statusByIndex.get(idx) ?? STATUS_CODE.AVAILABLE
      statusByIndex.set(idx, Math.max(currentCode, nextCode))
    }

    const overrides = Array.from(statusByIndex.entries()).map(([index, status]) => ({ index, status }))
    const soldSlots = soldCountRes.count || 0
    const reservedSlots = reservedCountRes.count || 0
    const disabledSlots = disabledCountRes.count || 0

    return NextResponse.json({
      sample,
      overrides,
      counts: {
        totalSlots: TOTAL_SLOTS,
        soldSlots,
        reservedSlots,
        disabledSlots,
        availableSlots: Math.max(0, TOTAL_SLOTS - soldSlots - reservedSlots - disabledSlots),
      },
    })
  } catch (error) {
    console.error('Planet slots API error:', error)
    return NextResponse.json({ error: 'Failed to fetch planet slot data' }, { status: 500 })
  }
}

