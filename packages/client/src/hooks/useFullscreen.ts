import { useState, useEffect, useCallback, RefObject } from 'react'

export const useFullscreen = (elementRef?: RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement

      if (elementRef?.current) {
        setIsFullscreen(fullscreenElement === elementRef.current)
      } else {
        setIsFullscreen(!!fullscreenElement)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [elementRef])

  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return

    try {
      const target = elementRef?.current || document.documentElement

      if (!document.fullscreenElement) {
        await target.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err)
    }
  }, [elementRef])

  return { isFullscreen, toggleFullscreen }
}
