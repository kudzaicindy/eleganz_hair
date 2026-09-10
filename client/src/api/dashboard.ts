import type { DashboardData } from '../types'

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const res = await fetch('/api/dashboard', {
    headers: authHeaders(token),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Could not load your dashboard')
  }

  return res.json()
}

export async function markLessonComplete(token: string, lessonId: string) {
  const res = await fetch(`/api/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: authHeaders(token),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Could not save progress')
  }
}

export async function fetchMe(token: string) {
  const res = await fetch('/api/me', {
    headers: authHeaders(token),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.user
}
