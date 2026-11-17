import type { Middleware } from 'openapi-fetch'
import type { Session, SessionNotice } from '../interfaces/session'
import type { Refresher } from './refresh'
import { isAccessTokenExpired } from './session'

export interface AuthMiddlewareOptions {
  refresher: Refresher
  readSession: () => Session | null
  clearSession: () => void
  onSessionEnded: (notice: SessionNotice) => void
  now?: () => Date
  fetch?: (request: Request) => Promise<Response>
}

const PUBLIC_PATHS = new Set(['/api/Auth/signin', '/api/Auth/signup', '/api/Auth/refresh'])

const NOT_RENEWED_PATHS = new Set([
  ...PUBLIC_PATHS,
  '/api/Auth/change-password',
  '/api/Auth/signout',
  '/api/Auth/signout-all',
])

const bearer = (token: string) => `Bearer ${token}`

const tokenOf = (request: Request) => request.headers.get('Authorization')?.replace(/^Bearer /, '')

export const createAuthMiddleware = ({
  refresher,
  readSession,
  clearSession,
  onSessionEnded,
  now = () => new Date(),
  fetch = (request) => globalThis.fetch(request),
}: AuthMiddlewareOptions): Middleware => {
  const copies = new WeakMap<Request, Request>()

  const currentToken = async (): Promise<string | undefined> => {
    const session = readSession()
    if (!session) return undefined
    if (!isAccessTokenExpired(session, now())) return session.accessToken

    const outcome = await refresher.renew(session.accessToken)
    if (outcome.kind === 'renewed') return outcome.session.accessToken
    if (outcome.kind === 'unavailable') throw outcome.error
    return undefined
  }

  return {
    async onRequest({ request, schemaPath }) {
      if (PUBLIC_PATHS.has(schemaPath)) return undefined
      const token = await currentToken()
      if (token) request.headers.set('Authorization', bearer(token))
      copies.set(request, request.clone())
      return request
    },

    async onResponse({ request, response, schemaPath }) {
      if (response.status !== 401 || NOT_RENEWED_PATHS.has(schemaPath)) return undefined
      const copy = copies.get(request)
      const staleToken = tokenOf(request)
      if (!copy || !staleToken) return undefined

      const outcome = await refresher.renew(staleToken)
      if (outcome.kind === 'unavailable') throw outcome.error
      if (outcome.kind === 'refused') return undefined

      copy.headers.set('Authorization', bearer(outcome.session.accessToken))
      const repeated = await fetch(copy)
      if (repeated.status === 401) {
        clearSession()
        onSessionEnded('sessao-expirada')
      }
      return repeated
    },
  }
}
