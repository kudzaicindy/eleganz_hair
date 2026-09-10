import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDownIcon } from './icons/SocialIcons'
import './NavDropdown.css'

export type DropdownItem = {
  to?: string
  label: string
  description?: string
  onClick?: () => void
  danger?: boolean
}

type NavDropdownProps = {
  label: string
  items: DropdownItem[]
  matchPaths?: string[]
  variant?: 'nav' | 'account'
  triggerContent?: ReactNode
  menuHeader?: ReactNode
}

export default function NavDropdown({
  label,
  items,
  matchPaths = [],
  variant = 'nav',
  triggerContent,
  menuHeader,
}: NavDropdownProps) {
  const menuId = useId()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const isActive = matchPaths.some((path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path),
  )

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const close = () => setOpen(false)

  return (
    <div
      ref={rootRef}
      className={`nav-dropdown nav-dropdown--${variant} ${open ? 'nav-dropdown--open' : ''} ${isActive ? 'nav-dropdown--active' : ''}`}
    >
      <button
        type="button"
        className="nav-dropdown-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {triggerContent ?? (
          <>
            <span>{label}</span>
            <ChevronDownIcon className="nav-dropdown-chevron" />
          </>
        )}
      </button>

      <div id={menuId} className="nav-dropdown-menu" role="menu">
        {menuHeader && <div className="nav-dropdown-header">{menuHeader}</div>}
        {items.map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              role="menuitem"
              className={`nav-dropdown-item ${item.danger ? 'nav-dropdown-item--danger' : ''}`}
              onClick={close}
            >
              <span className="nav-dropdown-item-label">{item.label}</span>
              {item.description && (
                <span className="nav-dropdown-item-desc">{item.description}</span>
              )}
            </Link>
          ) : (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`nav-dropdown-item ${item.danger ? 'nav-dropdown-item--danger' : ''}`}
              onClick={() => {
                item.onClick?.()
                close()
              }}
            >
              <span className="nav-dropdown-item-label">{item.label}</span>
              {item.description && (
                <span className="nav-dropdown-item-desc">{item.description}</span>
              )}
            </button>
          ),
        )}
      </div>
    </div>
  )
}
