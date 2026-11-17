import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

interface Options {
  retryDelay?: number
}

const MAX_RETRIES = 1
const DEFAULT_RETRY_DELAY_MS = 2000

const shouldRetry = (failureCount: number, error: unknown) =>
  error instanceof ApiError && error.status === 502 && failureCount < MAX_RETRIES

export const createQueryClient = ({ retryDelay = DEFAULT_RETRY_DELAY_MS }: Options = {}): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, retryDelay },
    },
  })
