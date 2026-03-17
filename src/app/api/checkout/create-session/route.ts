import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAuthUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { STRIPE_CONFIG } from '@/lib/config'
import { TOTAL_SLOTS } from '@/lib/constants'

const PACKS = {
  1: { slots: 1, price: 1, originalPrice: 1, discount: 0, name: 'Slot Unique' },
  10: { slots: 10, price: 9, originalPrice: 10, discount: 10, name: 'Pack 10 Slots' },
  50: { slots: 50, price: 40, originalPrice: 50, discount: 20, name: 'Pack 50 Slots' },
  100: { slots: 100, price: 75, originalPrice: 100, discount: 25, name: 'Pack 100 Slots' },
} as const

function sanitizeMetadataValue(value: unknown, maxLength = 500): string {
  if (!value) return ''
  return String(value).slice(0, maxLength)
}

export async function POST(request: NextRequest) {
  try {
    if (!STRIPE_CONFIG.secretKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const packSize = Number(body.packSize || 1)
    const selectedSlotNumber = Number(body.slotNumber || 0)
    const pack = PACKS[packSize as keyof typeof PACKS]
    if (!pack) {
      return NextResponse.json({ error: 'Invalid pack size' }, { status: 400 })
    }

    if (selectedSlotNumber && (selectedSlotNumber < 1 || selectedSlotNumber > TOTAL_SLOTS)) {
      return NextResponse.json({ error: 'Selected slot is out of range' }, { status: 400 })
    }

    const stripe = new Stripe(STRIPE_CONFIG.secretKey)
    const siteUrl = new URL(request.url).origin
    const supabase = await getSupabaseServerClient()

    if (pack.slots === 1 && selectedSlotNumber) {
      const { data: selectedSlot, error: selectedSlotError } = await supabase
        .from('slots')
        .select('slot_number,status')
        .eq('slot_number', selectedSlotNumber)
        .maybeSingle()

      if (selectedSlotError) {
        return NextResponse.json({ error: selectedSlotError.message }, { status: 500 })
      }

      if (selectedSlot && (selectedSlot.status === 'SOLD' || selectedSlot.status === 'DISABLED')) {
        return NextResponse.json(
          { error: `Slot #${selectedSlotNumber} is no longer available` },
          { status: 409 }
        )
      }
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: authUser.id,
        pack_size: pack.slots,
        pack_name: pack.name,
        amount: pack.price,
        original_amount: pack.originalPrice,
        discount_percent: pack.discount,
        currency: 'EUR',
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: purchaseError?.message || 'Failed to initialize purchase' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: authUser.email,
      client_reference_id: purchase.id,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&pack=${pack.slots}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        purchase_id: purchase.id,
        user_id: authUser.id,
        pack_size: String(pack.slots),
        pack_name: pack.name,
        original_amount: String(pack.originalPrice),
        discount: String(pack.discount),
        selected_slot_number: selectedSlotNumber ? String(selectedSlotNumber) : '',
        template_title: sanitizeMetadataValue(body.title, 120),
        template_description: sanitizeMetadataValue(body.description, 250),
        template_target_url: sanitizeMetadataValue(body.targetUrl, 250),
        template_category_slug: sanitizeMetadataValue(body.categoryId, 80),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(pack.price * 100),
            product_data: {
              name: pack.name,
              description: `${pack.slots} slots - Lifetime ownership`,
            },
          },
        },
      ],
    })

    await supabase
      .from('purchases')
      .update({ stripe_session_id: session.id })
      .eq('id', purchase.id)

    return NextResponse.json({
      purchaseId: purchase.id,
      sessionId: session.id,
      checkoutUrl: session.url,
      amount: pack.price,
      currency: 'EUR',
      selectedSlotNumber: selectedSlotNumber || null,
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
