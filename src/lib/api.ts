import { cache } from 'react'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const getGlobalStats = cache(async () => {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from('global_stats').select('*').single()
  if (error) throw error
  return data
})

export const getCategories = cache(async () => {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
})

export const getSlotByNumber = cache(async (slotNumber: number) => {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('slots')
    .select('*, category:categories(*), owner:profiles(id,name,avatar_url)')
    .eq('slot_number', slotNumber)
    .single()
  if (error) return null
  return data
})

export async function getSlots(options: {
  page?: number
  limit?: number
  status?: string[]
  categoryId?: string
  search?: string
  ownerId?: string
}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, options.limit || DEFAULT_PAGE_SIZE))
  const supabase = await getSupabaseServerClient()
  let query = supabase
    .from('slots')
    .select('*, category:categories(*), owner:profiles(id,name,avatar_url)', { count: 'exact' })
    .range((page - 1) * limit, page * limit - 1)
    .order('slot_number', { ascending: true })

  if (options.status?.length) query = query.in('status', options.status)
  if (options.categoryId) query = query.eq('category_id', options.categoryId)
  if (options.ownerId) query = query.eq('owner_id', options.ownerId)
  if (options.search) query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`)

  const { data, count, error } = await query
  if (error) throw error

  return {
    slots: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: page * limit < (count || 0),
    },
  }
}

