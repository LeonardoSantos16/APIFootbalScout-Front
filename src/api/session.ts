import type { AuthResponse, Session } from '../interfaces/session'

export const SESSION_KEY = 'scout.session'

type Listener = () => void

const FIELDS = [
  'accessToken',
  'accessTokenExpiresAtUtc',
  'refreshToken',
  'refreshTokenExpiresAtUtc',
  'userId',
  'name',
  'email',
] as const satisfies readonly (keyof Session)[]

const listeners = new Set<Listener>()

let cachedRaw: string | null = null
let cachedSession: Session | null = null

const parse = (raw: string): Session | null => {
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return null
    const record = value as Record<string, unknown>
    if (!FIELDS.every((field) => typeof record[field] === 'string')) return null
    return Object.fromEntries(FIELDS.map((field) => [field, record[field]])) as unknown as Session
  } catch {
    return null
  }
}

const notify = () => listeners.forEach((listener) => listener())

export const readSession = (): Session | null => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw === cachedRaw) return cachedSession
  cachedRaw = raw
  cachedSession = raw === null ? null : parse(raw)
  return cachedSession
}

export const saveSession = (auth: AuthResponse): Session => {
  const session = Object.fromEntries(FIELDS.map((field) => [field, auth[field]])) as unknown as Session
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  notify()
  return readSession() ?? session
}

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY)
  notify()
}

const isPast = (isoDate: string, now: Date) => Date.parse(isoDate) <= now.getTime()

export const isAccessTokenExpired = (session: Session, now: Date): boolean =>
  isPast(session.accessTokenExpiresAtUtc, now)

export const isRefreshTokenExpired = (session: Session, now: Date): boolean =>
  isPast(session.refreshTokenExpiresAtUtc, now)

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
