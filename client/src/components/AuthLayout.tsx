import type { ReactNode } from 'react'
import { images, videos } from '../data/images'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page auth-page--split">
      <div className="auth-visual">
        <video
          className="auth-visual-video"
          src={videos.revamp}
          poster="/hair.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Wig revamp training preview"
        />
        <div className="auth-visual-overlay" aria-hidden="true" />
        <div className="auth-visual-content">
          <span className="auth-visual-eyebrow">Eleganz Training</span>
          <h2>Master Wig Revamp &amp; Customization</h2>
          <p>Premium video lessons for stylists — learn at your pace, grow your income.</p>
        </div>
      </div>

      <div
        className="auth-panel auth-panel--hero"
        style={{ backgroundImage: `url('${images.hero}')` }}
      >
        <div className="auth-panel-overlay" aria-hidden="true" />
        <div className="auth-form-wrap">
          <div className="auth-card auth-card--floating">
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
            <p className="auth-footer">{footer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
