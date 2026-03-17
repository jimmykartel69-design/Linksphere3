/**
 * API Route - Single Slot by Number
 * Returns slot details by slot number
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { BASE_SLOT_PRICE_EUR, TOTAL_SLOTS } from '@/lib/constants'
import { calculateSlotPosition } from '@/lib/slot-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params
    const slotNumber = parseInt(number)

    if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > TOTAL_SLOTS) {
      return NextResponse.json(
        { error: `Invalid slot number. Must be between 1 and ${TOTAL_SLOTS}` },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await getSupabaseServerClient()

    // Get slot
    const { data: slot, error } = await supabase
      .from('slots')
      .select(`
        *,
        category:categories(*),
        owner:profiles(id, name, avatar_url)
      `)
      .eq('slot_number', slotNumber)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch slot' }, { status: 500 })
    }

    // Sparse mode: if slot row does not exist yet, expose it as available.
    if (!slot) {
      const coords = calculateSlotPosition(slotNumber)
      return NextResponse.json({
        slot: {
          id: `virtual-${slotNumber}`,
          slot_number: slotNumber,
          status: 'AVAILABLE',
          theta: coords.theta,
          phi: coords.phi,
          title: null,
          description: null,
          target_url: null,
          logo_url: null,
          banner_url: null,
          category: null,
          owner: null,
          purchased_at: null,
          purchase_price: BASE_SLOT_PRICE_EUR,
          view_count: 0,
          click_count: 0,
        },
        isVirtual: true,
      })
    }

    // Increment view count best-effort
    const nextViewCount = (slot.view_count || 0) + 1
    void supabase
      .from('slots')
      .update({ view_count: nextViewCount })
      .eq('id', slot.id)

    return NextResponse.json({ slot })
  } catch (error) {
    console.error('Error fetching slot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slot' },
      { status: 500 }
    )
  }
}
