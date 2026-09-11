type IconProps = {
  className?: string
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 8.5h2.5V5.5H14c-2.5 0-4 1.55-4 4.25V12H7.5v3h2.5v7.5h3V15h2.55l.45-3H13v-2.1c0-.85.15-1.4 1-1.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a8.5 8.5 0 0 0-7.35 12.75L3.5 20.5l4.9-1.1A8.5 8.5 0 1 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.05c.2-.45.4-.47.58-.48h.42c.13 0 .28-.02.42.32.16.36.55 1.34.6 1.44.05.1.08.22-.02.35-.1.13-.15.22-.3.35-.15.14-.32.31-.46.42-.15.12-.3.25-.13.48.17.24.76 1.24 1.63 2 .98.87 1.8 1.14 2.05 1.27.25.13.4.11.55-.07.15-.17.63-.73.8-.98.17-.25.34-.2.58-.12.24.08 1.52.72 1.78.85.26.13.43.2.5.31.07.12.07.7-.16 1.37-.23.67-1.35 1.28-1.87 1.35-.52.07-1.04.05-1.58-.12-.54-.17-1.28-.5-1.98-1.02-.73-.55-1.22-1.22-1.37-1.43-.15-.2-1.3-1.7-1.3-3.24 0-1.54.8-2.3 1.08-2.62.28-.32.62-.4.84-.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LocationIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v4.2l2.6 1.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
