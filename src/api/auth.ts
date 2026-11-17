import type { Middleware } from 'openapi-fetch'
import type { Session, SessionNotice } from '../interfaces/session'
import type { Refresher } from './refresh'

export interface AuthMiddlewareOptions {
  refresher: Refresher
  readSession: () => Session | null
  clearSession: () => void
  onSessionEnded: (notice: SessionNotice) => void
  now?: () => Date
  fetch?: (request: Request) => Promise<Response>
}

export const createAuthMiddleware = (_options: AuthMiddlewareOptions): Middleware => ({
  onRequest() {
    throw new Error('não implementado')
  },
})
