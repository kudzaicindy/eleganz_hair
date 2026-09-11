import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../api/dashboard'
import { useAuth } from '../context/AuthContext'
import type { DashboardData, Subscription } from '../types'
import { formatSubscriptionDate, subscriptionIsActive } from '../utils/subscription'
import './Account.css'

export default function Account() {
  const { user, token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    let cancelled = false
    setLoading(true)
    setError('')

    fetchDashboard(token)
      .then((dashboard) => {
        if (cancelled) return
        setData(dashboard)
        updateUser(dashboard.user)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, updateUser])

  const subscription = data?.subscription ?? user?.subscription ?? null
  const courses = data?.courses ?? []
  const isActive = subscriptionIsActive(subscription)

  if (loading) {
    return (
      <div className="account-page account-loading">
        <p>Loading your account…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="account-page account-loading">
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary">Sign in again</Link>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-hero">
        <div className="container account-hero-inner">
          <div>
            <span className="account-eyebrow">My Account</span>
            <h1>{user?.name ?? 'Your Account'}</h1>
            <p className="account-email">{user?.email}</p>
          </div>
          <Link to="/dashboard" className="btn btn-secondary account-back-link">
            Back to Training
          </Link>
        </div>
      </div>

      <section className="section account-section">
        <div className="container account-layout">
          <div className="account-card card">
            <h2>Your Plan</h2>
            <SubscriptionPanel
              subscription={subscription}
              isActive={isActive}
              courseCount={courses.length}
            />
          </div>

          <div className="account-card card account-help">
            <h2>Need help?</h2>
            <p>Contact us on WhatsApp or email for billing, access, and technical support.</p>
            <a href="https://wa.me" className="btn btn-secondary account-help-btn" target="_blank" rel="noopener noreferrer">
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function SubscriptionPanel({
  subscription,
  isActive,
  courseCount,
}: {
  subscription: Subscription | null
  isActive: boolean
  courseCount: number
}) {
  if (!subscription) {
    return (
      <>
        <p className="subscription-empty">You don&apos;t have an active subscription yet.</p>
        <Link to="/packages" className="btn btn-primary subscription-action">Choose a Plan</Link>
      </>
    )
  }

  return (
    <>
      <div className={`subscription-status subscription-status--${subscription.status}`}>
        <span className="subscription-plan">{subscription.packageName}</span>
        <span className={`badge badge-${isActive ? 'active' : 'expired'}`}>
          {isActive ? 'Active' : 'Expired'}
        </span>
      </div>
      <dl className="subscription-details">
        <div>
          <dt>Monthly price</dt>
          <dd>${subscription.price}/month</dd>
        </div>
        <div>
          <dt>{isActive ? 'Renews on' : 'Expired on'}</dt>
          <dd>{formatSubscriptionDate(subscription.expiresAt)}</dd>
        </div>
        <div>
          <dt>Courses unlocked</dt>
          <dd>{courseCount} course{courseCount !== 1 ? 's' : ''}</dd>
        </div>
      </dl>
      <Link to="/packages" className="btn btn-secondary subscription-action">
        {isActive ? 'Manage Plan' : 'Renew Subscription'}
      </Link>
    </>
  )
}
