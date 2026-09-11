import type { Subscription } from '../types'

export function subscriptionIsActive(sub: Subscription | null) {
  if (!sub || sub.status !== 'active') return false
  return new Date(sub.expiresAt) >= new Date()
}

export function formatSubscriptionDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
