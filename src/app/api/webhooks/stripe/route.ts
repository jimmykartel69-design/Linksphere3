import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '@/lib/config'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getBadgeFromSlotCount, TOTAL_SLOTS } from '@/lib/constants'
import { calculateSlotPosition } from '@/lib/slot-utils'

const stripe = STRIPE_CONFIG.secretKey ? new Stripe(STRIPE_CONFIG.secretKey) : null
const BLOCKING_STATUSES = ['SOLD', 'RESERVED', 'DISABLED'] as const
const BATCH_SCAN_SIZE = 250

type SlotTemplate = {
  title: string | null
  description: string | null
  target_url: string | null
  category_id: string | null
  category_slug: string | null
}

function toNullableString(value: string | undefined): string | null {
  if (!value || !value.trim()) return null
  return value.trim()
}

function buildCandidateBatch(startSlot: number, size: number): number[] {
  const list: number[] = []
  for (let i = 0; i < size; i++) {
    const slot = ((startSlot - 1 + i) % TOTAL_SLOTS) + 1
    list.push(slot)
  }
  return list
}

async function assignSlotToUser(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  slotNumber: number,
  userId: string,
  purchasePrice: number,
  purchasedAt: string,
  template: SlotTemplate
): Promise<boolean> {
  const { data: existing, error: fetchError } = await supabase
    .from('slots')
    .select('id,status')
    .eq('slot_number', slotNumber)
    .maybeSingle()

  if (fetchError) return false

  if (!existing) {
    const coords = calculateSlotPosition(slotNumber)
    const { error: insertError } = await supabase.from('slots').insert({
      slot_number: slotNumber,
      status: 'SOLD',
      owner_id: userId,
      purchased_at: purchasedAt,
      purchase_price: purchasePrice,
      theta: coords.theta,
      phi: coords.phi,
      title: template.title,
      description: template.description,
      target_url: template.target_url,
      category_id: template.category_id,
    })
    return !insertError
  }

  if (existing.status === 'SOLD' || existing.status === 'DISABLED') {
    return false
  }

  const { error: updateError } = await supabase
    .from('slots')
    .update({
      owner_id: userId,
      status: 'SOLD',
      purchased_at: purchasedAt,
      purchase_price: purchasePrice,
      title: template.title,
      description: template.description,
      target_url: template.target_url,
      category_id: template.category_id,
    })
    .eq('id', existing.id)
    .in('status', ['AVAILABLE', 'RESERVED'])

  return !updateError
}

async function allocateSlots(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
  packSize: number,
  selectedSlotNumber: number | null,
  purchasePricePerSlot: number,
  purchasedAt: string,
  template: SlotTemplate
): Promise<number[]> {
  const assigned: number[] = []
  const assignedSet = new Set<number>()

  if (selectedSlotNumber && packSize === 1) {
    const selectedAssigned = await assignSlotToUser(
      supabase,
      selectedSlotNumber,
      userId,
      purchasePricePerSlot,
      purchasedAt,
      template
    )
    if (selectedAssigned) {
      assigned.push(selectedSlotNumber)
      assignedSet.add(selectedSlotNumber)
    }
  }

  let cursor = selectedSlotNumber || 1
  let scanned = 0

  while (assigned.length < packSize && scanned < TOTAL_SLOTS + BATCH_SCAN_SIZE) {
    const batch = buildCandidateBatch(cursor, BATCH_SCAN_SIZE)
    cursor = batch[batch.length - 1] + 1
    scanned += batch.length

    const { data: occupiedRows, error } = await supabase
      .from('slots')
      .select('slot_number,status')
      .in('slot_number', batch)
      .in('status', [...BLOCKING_STATUSES])

    if (error) break

    const blocked = new Set<number>((occupiedRows || []).map((row) => Number(row.slot_number)))
    const candidates = batch.filter((slotNumber) => !blocked.has(slotNumber) && !assignedSet.has(slotNumber))

    for (const slotNumber of candidates) {
      const done = await assignSlotToUser(
        supabase,
        slotNumber,
        userId,
        purchasePricePerSlot,
        purchasedAt,
        template
      )
      if (!done) continue
      assigned.push(slotNumber)
      assignedSet.add(slotNumber)
      if (assigned.length >= packSize) break
    }
  }

  return assigned
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !STRIPE_CONFIG.webhookSecret) {
      return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 })
    }

    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
    }

    const body = await request.text()
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)

    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const supabase = await getSupabaseServerClient()

    const purchaseId = session.metadata?.purchase_id || session.client_reference_id
    const userId = session.metadata?.user_id
    const packSize = Number(session.metadata?.pack_size || 1)
    const selectedSlotNumber = Number(session.metadata?.selected_slot_number || 0) || null
    const amountTotal = (session.amount_total || 0) / 100
    const currency = (session.currency || 'eur').toUpperCase()
    const purchasePricePerSlot = amountTotal / Math.max(packSize, 1)
    const purchasedAt = new Date().toISOString()

    if (!purchaseId || !userId) {
      return NextResponse.json({ error: 'Missing purchase metadata' }, { status: 400 })
    }

    const template: SlotTemplate = {
      title: toNullableString(session.metadata?.template_title),
      description: toNullableString(session.metadata?.template_description),
      target_url: toNullableString(session.metadata?.template_target_url),
      category_id: null,
      category_slug: toNullableString(session.metadata?.template_category_slug),
    }

    if (template.category_slug) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', template.category_slug)
        .maybeSingle()
      template.category_id = category?.id || null
    }

    const { data: existingPurchase, error: purchaseFetchError } = await supabase
      .from('purchases')
      .select('id,status,stripe_session_id')
      .eq('id', purchaseId)
      .maybeSingle()

    if (purchaseFetchError || !existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    if (
      existingPurchase.status === 'COMPLETED' &&
      existingPurchase.stripe_session_id === session.id
    ) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const assignedSlotNumbers = await allocateSlots(
      supabase,
      userId,
      packSize,
      selectedSlotNumber,
      purchasePricePerSlot,
      purchasedAt,
      template
    )

    if (assignedSlotNumbers.length < packSize) {
      await supabase
        .from('purchases')
        .update({
          stripe_session_id: session.id,
          stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amount: amountTotal,
          currency,
          status: 'FAILED',
        })
        .eq('id', purchaseId)

      return NextResponse.json({ error: 'Not enough available slots to fulfill purchase' }, { status: 409 })
    }

    const { error: purchaseUpdateError } = await supabase
      .from('purchases')
      .update({
        stripe_session_id: session.id,
        stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount: amountTotal,
        currency,
        status: 'COMPLETED',
        purchased_at: purchasedAt,
      })
      .eq('id', purchaseId)

    if (purchaseUpdateError) {
      return NextResponse.json({ error: purchaseUpdateError.message }, { status: 500 })
    }

    const { count: ownedCount } = await supabase
      .from('slots')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'SOLD')

    const badge = getBadgeFromSlotCount(ownedCount || 0)
    await supabase.from('profiles').update({ badge }).eq('id', userId)

    const [soldRes, reservedRes, disabledRes] = await Promise.all([
      supabase.from('slots').select('id', { count: 'exact', head: true }).eq('status', 'SOLD'),
      supabase.from('slots').select('id', { count: 'exact', head: true }).eq('status', 'RESERVED'),
      supabase.from('slots').select('id', { count: 'exact', head: true }).eq('status', 'DISABLED'),
    ])

    const soldSlots = soldRes.count || 0
    const reservedSlots = reservedRes.count || 0
    const disabledSlots = disabledRes.count || 0
    const availableSlots = Math.max(0, TOTAL_SLOTS - soldSlots - reservedSlots - disabledSlots)

    const { data: stats } = await supabase
      .from('global_stats')
      .select('*')
      .single()

    if (stats) {
      await supabase
        .from('global_stats')
        .update({
          sold_slots: soldSlots,
          reserved_slots: reservedSlots,
          available_slots: availableSlots,
          total_revenue: (stats.total_revenue || 0) + amountTotal,
          total_purchases: (stats.total_purchases || 0) + 1,
        })
        .eq('id', stats.id)
    }

    return NextResponse.json({
      received: true,
      assignedSlotNumbers,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}
