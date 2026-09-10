import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Package } from '../types'
import './Packages.css'

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        setPackages(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Subscription Packages</h1>
          <p>Choose the plan that unlocks the training you need. Renew monthly to keep access.</p>
        </div>
      </div>

      <section className="section packages-section">
        <div className="container">
          {loading ? (
            <p className="loading-text">Loading packages…</p>
          ) : (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <article
                  key={pkg.id}
                  className={`package-card card ${pkg.featured ? 'featured' : ''}`}
                >
                  {pkg.featured && <span className="package-badge">Most Popular</span>}
                  <h2>{pkg.name}</h2>
                  <div className="package-price">
                    <span className="amount">${pkg.price}</span>
                    <span className="period">/ month</span>
                  </div>
                  <p className="package-desc">{pkg.description}</p>
                  <ul className="package-features">
                    {pkg.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link to="/register" className="btn btn-primary package-cta">
                    Subscribe Now
                  </Link>
                </article>
              ))}
            </div>
          )}

          <div className="payment-note card">
            <h3>Secure Local Payments</h3>
            <p>
              Pay with EcoCash, bank transfer, or debit/credit card. Access activates
              automatically once your payment is confirmed.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
