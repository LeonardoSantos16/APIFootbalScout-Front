import { fetchClient } from './client'
import { clearSession, readSession } from './session'

export type SignOutScope = 'device' | 'all'

export const signOut = (scope: SignOutScope): void => {
  const session = readSession()
  if (session) {
    const headers = { Authorization: `Bearer ${session.accessToken}` }
    const call =
      scope === 'device'
        ? fetchClient.POST('/api/Auth/signout', { body: { refreshToken: session.refreshToken }, headers })
        : fetchClient.POST('/api/Auth/signout-all', { headers })
    call.catch(() => undefined)
  }
  clearSession()
}
