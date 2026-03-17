import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '@/lib/config'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getBadgeFromSlotCount } from '@/lib/constants'

const stripe = STRIPE_CONFIG.secretKey ? new Stripe(STRIPE_CONFIG.secretKey) : null

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
    const amountTotal = (session.amount_total || 0) / 100
    const currency = (session.currency || 'eur').toUpperCase()

    if (!purchaseId || !userId) {
      return NextResponse.json({ error: 'Missing purchase metadata' }, { status: 400 })
    }

    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id,status,stripe_session_id')
      .eq('id', purchaseId)
      .single()

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    if (
      existingPurchase.status === 'COMPLETED' &&
      existingPurchase.stripe_session_id === session.id
    ) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const { error: purchaseUpdateError } = await supabase
      .from('purchases')
      .update({
        stripe_session_id: session.id,
        stripe_payment_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount: amountTotal,
        currency,
        status: 'COMPLETED',
      })
      .eq('id', purchaseId)

    if (purchaseUpdateError) {
      return NextResponse.json({ error: purchaseUpdateError.message }, { status: 500 })
    }

    // Assign slots to purchaser.
    const { data: freeSlots, error: freeSlotsError } = await supabase
      .from('slots')
      .select('id')
      .eq('status', 'AVAILABLE')
      .limit(packSize)

    if (freeSlotsError) {
      return NextResponse.json({ error: freeSlotsError.message }, { status: 500 })
    }

    const now = new Date().toISOString()
    for (const slot of freeSlots || []) {
      const { error: slotUpdateError } = await supabase
        .from('slots')
        .update({
          owner_id: userId,
          status: 'SOLD',
          purchased_at: now,
          purchase_price: amountTotal / Math.max(packSize, 1),
        })
        .eq('id', slot.id)
        .eq('status', 'AVAILABLE')

      if (slotUpdateError) {
        console.error('Slot update failed:', slotUpdateError)
      }
    }

    const { count: ownedCount } = await supabase
      .from('slots')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)

    const badge = getBadgeFromSlotCount(ownedCount || 0)
    await supabase.from('profiles').update({ badge }).eq('id', userId)

    const { data: stats } = await supabase.from('global_stats').select('*').single()
    if (stats) {
      await supabase
        .from('global_stats')
        .update({
          sold_slots: Math.max(0, (stats.sold_slots || 0) + packSize),
          available_slots: Math.max(0, (stats.available_slots || 0) - packSize),
          total_revenue: (stats.total_revenue || 0) + amountTotal,
          total_purchases: (stats.total_purchases || 0) + 1,
        })
        .eq('id', stats.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}

