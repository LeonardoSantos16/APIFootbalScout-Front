import type { AuthResponse, Session, SessionNotice } from '../interfaces/session'

export const REFRESH_LOCK = 'scout-refresh'

export type Lock = <T>(name: string, task: () => Promise<T>) => Promise<T>

export type RenewalOutcome =
  | { kind: 'renewed'; session: Session }
  | { kind: 'refused' }
  | { kind: 'unavailable'; error: unknown }

export interface RefresherOptions {
  readSession: () => Session | null
  saveSession: (auth: AuthResponse) => Session
  clearSession: () => void
  requestRefresh: (refreshToken: string) => Promise<AuthResponse>
  onSessionEnded: (notice: SessionNotice) => void
  lock?: Lock
}

export interface Refresher {
  renew: (staleAccessToken: string) => Promise<RenewalOutcome>
}

export const browserLock: Lock = (_name, task) => task()

export const createRefresher = (_options: RefresherOptions): Refresher => ({
  renew: () => {
    throw new Error('não implementado')
  },
})
