import { QueryClient } from '@tanstack/react-query'

type Options = {
  retryDelay?: number
}

export const createQueryClient = (_options: Options = {}): QueryClient =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } })
