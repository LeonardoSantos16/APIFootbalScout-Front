import createFetchClient, { type Middleware } from 'openapi-fetch'
import createQueryClient from 'openapi-react-query'
import type { paths } from './schema'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.clone().text()
  if (!text) return undefined
  if (!response.headers.get('content-type')?.includes('json')) return text
  return JSON.parse(text)
}

const errors: Middleware = {
  async onResponse({ response }) {
    if (!response.ok) throw new ApiError(response.status, await readBody(response))
  },
}

export const fetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? '',
  fetch: (request) => globalThis.fetch(request),
})
fetchClient.use(errors)

export const $api = createQueryClient(fetchClient)
