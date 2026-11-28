import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { MAIN_CONTENT_ID } from '../components/SkipLink/mainContent'
import { shouldMoveFocus } from '../utils/pageChange'

const HEADING_WAIT_MS = 5000

const focusHeading = (main: HTMLElement): boolean => {
  const heading = main.querySelector<HTMLElement>('h1')
  if (!heading) return false
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
  heading.focus()
  return true
}

const moveFocus = (): (() => void) | undefined => {
  const main = document.getElementById(MAIN_CONTENT_ID)
  if (!main || main.contains(document.activeElement)) return undefined
  if (focusHeading(main)) return undefined
  main.focus()
  const observer = new MutationObserver(() => {
    if (document.activeElement !== main) return observer.disconnect()
    if (focusHeading(main)) observer.disconnect()
  })
  observer.observe(main, { childList: true, subtree: true })
  const timer = window.setTimeout(() => observer.disconnect(), HEADING_WAIT_MS)
  return () => {
    observer.disconnect()
    window.clearTimeout(timer)
  }
}

export const usePageFocus = () => {
  const router = useRouter()

  useEffect(() => {
    let stopWaiting: (() => void) | undefined
    const unsubscribe = router.subscribe('onResolved', ({ fromLocation, toLocation }) => {
      if (!shouldMoveFocus(fromLocation?.href, toLocation.href)) return
      stopWaiting?.()
      stopWaiting = moveFocus()
    })
    return () => {
      stopWaiting?.()
      unsubscribe()
    }
  }, [router])
}
