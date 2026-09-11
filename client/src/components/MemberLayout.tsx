import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './MemberLayout.css'

type MemberLayoutProps = {
  eyebrow: string
  title: string
  children: ReactNode
}

export default function MemberLayout({ eyebrow, title, children }: MemberLayoutProps) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userInitial = (user?.name?.[0] ?? user?.email?.[0] ?? 'E').toUpperCase()

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="member-page">
      {sidebarOpen && (
        <button
          type="button"
          className="member-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`member-sidebar ${sidebarOpen ? 'member-sidebar--open' : ''}`}>
        <div className="member-sidebar-top">
          <Link to="/" className="member-sidebar-logo">
            <span className="member-sidebar-logo-mark">E</span>
            <span>Eleganz</span>
          </Link>
          <button
            type="button"
            className="member-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="member-sidebar-nav" aria-label="Member navigation">
          <NavLink to="/dashboard" end className="member-sidebar-link">
            My Training
          </NavLink>
          <NavLink to="/courses" className="member-sidebar-link">
            Courses
          </NavLink>
          <NavLink to="/account" className="member-sidebar-link">
            Account
          </NavLink>
          <Link to="/packages" className="member-sidebar-link">
            Packages
          </Link>
          <Link to="/" className="member-sidebar-link">
            Home
          </Link>
          <button type="button" className="member-sidebar-link member-sidebar-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      </aside>

      <div className="member-main">
        <header className="member-main-header">
          <button
            type="button"
            className="member-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="member-main-header-copy">
            <span className="member-main-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
          </div>

          <span className="member-avatar" aria-hidden="true">{userInitial}</span>
        </header>

        <div className="member-main-body">{children}</div>
      </div>
    </div>
  )
}
