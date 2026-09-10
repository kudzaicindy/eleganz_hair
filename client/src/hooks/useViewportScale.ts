import { useEffect } from 'react'

/** Layout width the site is designed for — mobile viewports scale this down to fit. */
export const DESIGN_WIDTH = 1280

const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1.0, viewport-fit=cover'

function applyViewportScale() {
  const meta = document.querySelector('meta[name="viewport"]')
  if (!meta) return

  const width = window.innerWidth
  if (width < DESIGN_WIDTH) {
    const scale = width / DESIGN_WIDTH
    meta.setAttribute(
      'content',
      `width=${DESIGN_WIDTH}, initial-scale=${scale}, maximum-scale=${scale}, viewport-fit=cover`,
    )
  } else {
    meta.setAttribute('content', DEFAULT_VIEWPORT)
  }
}

export function useViewportScale() {
  useEffect(() => {
    applyViewportScale()

    const onResize = () => applyViewportScale()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      document.querySelector('meta[name="viewport"]')?.setAttribute('content', DEFAULT_VIEWPORT)
    }
  }, [])
}
