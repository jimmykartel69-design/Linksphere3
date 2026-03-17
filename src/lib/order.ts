/**
 * LinkSphere - Order utilities
 */

export function buildOrderNumber(purchaseId: string, dateInput?: string | null): string {
  const safeId = (purchaseId || '').replace(/-/g, '').slice(0, 8).toUpperCase()
  const date = dateInput ? new Date(dateInput) : new Date()
  const yyyy = date.getUTCFullYear().toString()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `LS-${yyyy}${mm}${dd}-${safeId || 'UNKNOWN'}`
}

