/**
 * API Route - Slots
 * Handles slot listing and search
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE))))
    
    // Parse filters
    const status = searchParams.getAll('status')
    const categoryId = searchParams.get('categoryId') || undefined
    const search = searchParams.get('search') || undefined
    const minSlot = searchParams.get('minSlot') ? parseInt(searchParams.get('minSlot')!) : undefined
    const maxSlot = searchParams.get('maxSlot') ? parseInt(searchParams.get('maxSlot')!) : undefined

    // Get Supabase client
    const supabase = await getSupabaseServerClient()

    // Build query
    let query = supabase
      .from('slots')
      .select('*, category:categories(*), owner:profiles(id, name, avatar_url)', { count: 'exact' })
      .order('slot_number', { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    // Apply filters
    if (status.length > 0) {
      query = query.in('status', status)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    if (minSlot !== undefined) {
      query = query.gte('slot_number', minSlot)
    }
    if (maxSlot !== undefined) {
      query = query.lte('slot_number', maxSlot)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: slots, count, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const total = count || 0

    return NextResponse.json({
      slots: slots || [],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    )
  }
}
