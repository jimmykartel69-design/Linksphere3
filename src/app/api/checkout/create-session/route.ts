import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAuthUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { STRIPE_CONFIG } from '@/lib/config'

const PACKS = {
  1: { slots: 1, price: 1, originalPrice: 1, discount: 0, name: 'Slot Unique' },
  10: { slots: 10, price: 9, originalPrice: 10, discount: 10, name: 'Pack 10 Slots' },
  50: { slots: 50, price: 40, originalPrice: 50, discount: 20, name: 'Pack 50 Slots' },
  100: { slots: 100, price: 75, originalPrice: 100, discount: 25, name: 'Pack 100 Slots' },
} as const

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
    const pack = PACKS[packSize as keyof typeof PACKS]
    if (!pack) {
      return NextResponse.json({ error: 'Invalid pack size' }, { status: 400 })
    }

    const stripe = new Stripe(STRIPE_CONFIG.secretKey)
    const siteUrl = new URL(request.url).origin
    const supabase = await getSupabaseServerClient()

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
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

