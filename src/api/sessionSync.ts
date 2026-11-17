import { SESSION_KEY, readSession } from './session'

interface SessionSyncHandlers {
  onSignedOut: () => void
  onAccountChanged: () => void
}

export const subscribeToOtherTabs = (listener: () => void): (() => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY || event.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export const startSessionSync = ({ onSignedOut, onAccountChanged }: SessionSyncHandlers): (() => void) => {
  let userId = readSession()?.userId

  return subscribeToOtherTabs(() => {
    const session = readSession()
    if (!session) {
      if (userId) onSignedOut()
      userId = undefined
      return
    }
    if (userId && session.userId !== userId) onAccountChanged()
    userId = session.userId
  })
}
