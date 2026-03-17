/**
 * API Route - Single Slot by Number
 * Returns slot details by slot number
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params
    const slotNumber = parseInt(number)

    if (isNaN(slotNumber)) {
      return NextResponse.json(
        { error: 'Invalid slot number' },
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
      .single()

    if (error || !slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
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
