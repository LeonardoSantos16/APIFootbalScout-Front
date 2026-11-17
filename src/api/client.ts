import createFetchClient, { type Middleware } from 'openapi-fetch'
import createQueryClient from 'openapi-react-query'
import type { SessionNotice } from '../interfaces/session'
import { ApiError } from './apiError'
import { createAuthMiddleware } from './auth'
import { createRefresher } from './refresh'
import type { paths } from './schema'
import { clearSession, readSession, saveSession } from './session'

export { ApiError } from './apiError'

type SessionEndedHandler = (notice: SessionNotice) => void

const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.clone().text()
  if (!text) return undefined
  if (!response.headers.get('content-type')?.includes('json')) return text
  return JSON.parse(text)
}

export const errorsMiddleware: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) throw new ApiError(response.status, await readBody(response))
  },
}

const createClient = () => {
  const client = createFetchClient<paths>({
    baseUrl: import.meta.env.VITE_API_URL ?? '',
    fetch: (request) => globalThis.fetch(request),
  })
  client.use(errorsMiddleware)
  return client
}

let sessionEndedHandler: SessionEndedHandler = () => undefined

export const onSessionEnded = (handler: SessionEndedHandler) => {
  sessionEndedHandler = handler
}

const endSession: SessionEndedHandler = (notice) => sessionEndedHandler(notice)

const refreshClient = createClient()

const refresher = createRefresher({
  readSession,
  saveSession,
  clearSession,
  onSessionEnded: endSession,
  requestRefresh: async (refreshToken) => {
    const { data } = await refreshClient.POST('/api/Auth/refresh', { body: { refreshToken } })
    if (!data) throw new ApiError(500, undefined)
    return data
  },
})

export const fetchClient = createClient()
fetchClient.use(createAuthMiddleware({ refresher, readSession, clearSession, onSessionEnded: endSession }))

export const $api = createQueryClient(fetchClient)
