import { noticeForCode } from '../utils/accountErrors'
import type { AuthResponse, Session, SessionNotice } from '../interfaces/session'
import { ApiError } from './apiError'

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

export const browserLock: Lock = (name, task) =>
  typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request(name, task) : task()

const codeOf = (body: unknown) =>
  typeof body === 'object' && body !== null ? (body as { code?: unknown }).code : undefined

export const createRefresher = ({
  readSession,
  saveSession,
  clearSession,
  requestRefresh,
  onSessionEnded,
  lock = browserLock,
}: RefresherOptions): Refresher => {
  let inFlight: Promise<RenewalOutcome> | null = null

  const end = (code?: unknown): RenewalOutcome => {
    clearSession()
    onSessionEnded(noticeForCode(code))
    return { kind: 'refused' }
  }

  const run = async (staleAccessToken: string): Promise<RenewalOutcome> => {
    const current = readSession()
    if (!current) return end()
    if (current.accessToken !== staleAccessToken) return { kind: 'renewed', session: current }

    try {
      const auth = await requestRefresh(current.refreshToken)
      return { kind: 'renewed', session: saveSession(auth) }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return end(codeOf(error.body))
      return { kind: 'unavailable', error }
    }
  }

  return {
    renew: (staleAccessToken) => {
      inFlight ??= lock(REFRESH_LOCK, () => run(staleAccessToken)).finally(() => {
        inFlight = null
      })
      return inFlight
    },
  }
}
