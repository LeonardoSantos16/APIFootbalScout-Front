import type { AuthResponse, Session } from '../interfaces/session'

export const SESSION_KEY = 'scout.session'

type Listener = () => void

export const readSession = (): Session | null => {
  throw new Error('não implementado')
}

export const saveSession = (_auth: AuthResponse): Session => {
  throw new Error('não implementado')
}

export const clearSession = (): void => {
  throw new Error('não implementado')
}

export const isAccessTokenExpired = (_session: Session, _now: Date): boolean => {
  throw new Error('não implementado')
}

export const isRefreshTokenExpired = (_session: Session, _now: Date): boolean => {
  throw new Error('não implementado')
}

export const subscribe = (_listener: Listener): (() => void) => {
  throw new Error('não implementado')
}
