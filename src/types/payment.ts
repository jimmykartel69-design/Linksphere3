/**
 * Payment type definitions
 */

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

/**
 * Purchase data
 */
export interface Purchase {
  id: string
  slotId: string
  userId: string
  amount: number
  currency: string
  stripeSessionId: string | null
  stripePaymentId: string | null
  status: PaymentStatus
  purchasedAt: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Purchase with slot details
 */
export interface PurchaseWithSlot extends Purchase {
  slot: {
    slotNumber: number
    title: string | null
  }
}

/**
 * Checkout session data
 */
export interface CheckoutSession {
  id: string
  url: string
  expiresAt: Date
  slots: ReservedSlot[]
  totalAmount: number
  currency: string
}

/**
 * Reserved slot during checkout
 */
export interface ReservedSlot {
  slotId: string
  slotNumber: number
  price: number
}

/**
 * Payment webhook data from Stripe
 */
export interface StripeWebhookData {
  id: string
  object: string
  type: string
  data: {
    object: {
      id: string
      payment_status: string
      customer_details?: {
        email: string
      }
      metadata?: Record<string, string>
    }
  }
}

/**
 * Price calculation result
 */
export interface PriceCalculation {
  basePrice: number
  quantity: number
  subtotal: number
  discount: number
  total: number
  currency: string
}

/**
 * Payment history item
 */
export interface PaymentHistoryItem {
  id: string
  date: Date
  amount: number
  currency: string
  status: PaymentStatus
  slotNumber: number
  description: string
}
