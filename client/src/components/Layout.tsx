import { useEffect, useState } from 'react'
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavDropdown from './NavDropdown'
import {
  ChevronDownIcon,
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LocationIcon,
  WhatsAppIcon,
} from './icons/SocialIcons'
import './Layout.css'

const socialLinks = [
  { href: 'https://instagram.com', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://facebook.com', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://wa.me', label: 'WhatsApp', Icon: WhatsAppIcon },
]

function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      {socialLinks.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          className="social-link"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <Icon />
        </a>
      ))}
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const isHome = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isDashboard = pathname === '/dashboard'
  const showHeader = !isDashboard
  const showFooter = !isAuthPage && !isDashboard
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const displayName = user?.name || user?.email.split('@')[0] || 'Account'

  const accountItems = user
    ? [
        { to: '/packages', label: 'Upgrade Plan', description: 'Change your package' },
        { label: 'Sign Out', onClick: handleSignOut, danger: true },
      ]
    : []

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const headerClass = [
    'header',
    isHome && !scrolled ? 'header--transparent' : 'header--solid',
    scrolled ? 'header--scrolled' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={`layout ${isHome ? 'layout--home' : ''} ${isAuthPage ? 'layout--auth' : ''} ${isDashboard ? 'layout--dashboard' : ''}`}>
      {showHeader && (
      <header className={headerClass}>
        <div className="header-bar">
          <div className="header-inner">
            <Link to="/" className="logo">
              <span className="logo-mark">E</span>
              <span className="logo-text">Eleganz</span>
            </Link>

            <nav className="nav nav-desktop" aria-label="Main navigation">
              <ul className="nav-list">
                <li>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link--active' : ''}`
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavDropdown
                    label="Training"
                    matchPaths={['/packages', '/courses']}
                    items={[
                      { to: '/packages', label: 'Packages', description: 'Basic, Premium & Full Access' },
                      { to: '/courses', label: 'Course Library', description: '50+ wig training videos' },
                    ]}
                  />
                </li>
                <li>
                  <NavLink
                    to="/packages"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link--active' : ''}`
                    }
                  >
                    Pricing
                  </NavLink>
                </li>
                {user && (
                  <>
                    <li>
                      <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'nav-link--active' : ''}`
                        }
                      >
                        Training
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/account"
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'nav-link--active' : ''}`
                        }
                      >
                        Account
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <div className="header-actions">
              {user ? (
                <NavDropdown
                  label="Account"
                  variant="account"
                  matchPaths={['/account']}
                  items={accountItems}
                  menuHeader={
                    <>
                      <strong>{displayName}</strong>
                      <span>{user.email}</span>
                    </>
                  }
                  triggerContent={
                    <span className="nav-dropdown-account-trigger">
                      <span className="nav-dropdown-account-avatar" aria-hidden="true">
                        {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                      </span>
                      <span className="nav-dropdown-account-name">{displayName}</span>
                      <ChevronDownIcon className="nav-dropdown-chevron" />
                    </span>
                  }
                />
              ) : (
                <NavDropdown
                  label="Access"
                  variant="account"
                  matchPaths={['/login', '/register']}
                  items={[
                    { to: '/login', label: 'Sign In', description: 'Access your training library' },
                    { to: '/register', label: 'Join Now', description: 'Create your account' },
                  ]}
                  triggerContent={
                    <span className="nav-dropdown-access-trigger">
                      <span>Access</span>
                      <ChevronDownIcon className="nav-dropdown-chevron" />
                    </span>
                  }
                />
              )}
            </div>

            <button
              type="button"
              className={`menu-toggle ${menuOpen ? 'menu-toggle--open' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`nav-mobile ${menuOpen ? 'nav-mobile--open' : ''}`}>
          <nav className="container nav-mobile-inner" aria-label="Mobile navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-mobile-link ${isActive ? 'nav-mobile-link--active' : ''}`}>
              Home
            </NavLink>
            <Link to="/packages" className="nav-mobile-link">Packages</Link>
            <Link to="/courses" className="nav-mobile-link">Courses</Link>
            {user && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `nav-mobile-link ${isActive ? 'nav-mobile-link--active' : ''}`}
                >
                  Training
                </NavLink>
                <NavLink
                  to="/account"
                  className={({ isActive }) => `nav-mobile-link ${isActive ? 'nav-mobile-link--active' : ''}`}
                >
                  Account
                </NavLink>
              </>
            )}
            <div className="nav-mobile-divider" />

            {user ? (
              <button type="button" className="nav-mobile-link nav-mobile-signout" onClick={handleSignOut}>
                Sign Out
              </button>
            ) : (
              <>
                <span className="nav-mobile-group-label">Access</span>
                <Link to="/login" className="nav-mobile-link">Sign In</Link>
                <Link to="/register" className="nav-mobile-link">Join Now</Link>
              </>
            )}

            <div className="nav-mobile-social">
              <SocialLinks className="nav-mobile-social-links" />
            </div>
          </nav>
        </div>
      </header>
      )}

      {showHeader && menuOpen && (
        <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      )}

      <main>
        <Outlet />
      </main>

      {showFooter && (
      <footer className="footer">
        <div className="footer-accent" aria-hidden="true" />
        <div className="container footer-inner">
          <div className="footer-top">
            <div className="footer-brand-col">
              <Link to="/" className="footer-brand">
                <span className="footer-logo-mark">E</span>
                <div>
                  <strong>Eleganz</strong>
                  <p>Wig revamp &amp; customization training</p>
                </div>
              </Link>
              <p className="footer-tagline">
                Premium online training for stylists who want to master wig revamp,
                customization, and client-ready results.
              </p>
              <SocialLinks className="footer-social footer-social--brand" />
            </div>

            <div className="footer-columns">
              <div className="footer-col">
                <h4 className="footer-heading">Explore</h4>
                <nav className="footer-nav">
                  <Link to="/packages">Packages</Link>
                  <Link to="/courses">Courses</Link>
                  <Link to="/register">Join Now</Link>
                </nav>
              </div>

              <div className="footer-col">
                <h4 className="footer-heading">Access</h4>
                <nav className="footer-nav">
                  <Link to="/login">Sign In</Link>
                  {!user && <Link to="/register">Create Account</Link>}
                  {user && <Link to="/account">My Account</Link>}
                </nav>
              </div>

              <div className="footer-col">
                <h4 className="footer-heading">Get in Touch</h4>
                <ul className="footer-contact">
                  <li>
                    <span className="footer-icon" aria-hidden="true">
                      <LocationIcon />
                    </span>
                    <div>
                      <span className="footer-contact-label">Location</span>
                      <span>Harare, Zimbabwe</span>
                    </div>
                  </li>
                  <li>
                    <span className="footer-icon" aria-hidden="true">
                      <ClockIcon />
                    </span>
                    <div>
                      <span className="footer-contact-label">Hours</span>
                      <span>Mon – Sat · 9AM – 6PM</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-mid">
            <div className="footer-trust">
              <span>EcoCash · Bank · Card</span>
              <span className="footer-trust-dot" aria-hidden="true">·</span>
              <span>50+ video lessons</span>
              <span className="footer-trust-dot" aria-hidden="true">·</span>
              <span>New content monthly</span>
            </div>
          </div>

          <div className="footer-bottom">
            <SocialLinks className="footer-social" />
            <p className="footer-copy">
              &copy; {new Date().getFullYear()} Eleganz. All rights reserved.
            </p>
            <p className="footer-credit">Crafted by Chynae Digital Solutions</p>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}
