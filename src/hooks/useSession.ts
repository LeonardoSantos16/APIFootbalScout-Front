import { useSyncExternalStore } from 'react'
import { readSession, subscribe } from '../api/session'
import { subscribeToOtherTabs } from '../api/sessionSync'
import type { Session } from '../interfaces/session'

const subscribeAll = (listener: () => void) => {
  const stopLocal = subscribe(listener)
  const stopOtherTabs = subscribeToOtherTabs(listener)
  return () => {
    stopLocal()
    stopOtherTabs()
  }
}

export const useSession = (): Session | null => useSyncExternalStore(subscribeAll, readSession)
