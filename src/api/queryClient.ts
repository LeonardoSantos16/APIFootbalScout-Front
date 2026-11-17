import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './client'

type Options = {
  retryDelay?: number
}

const MAXIMO_DE_REPETICOES = 1
const ESPERA_PADRAO_EM_MS = 2000

const deveRepetir = (tentativasFalhas: number, error: unknown) =>
  error instanceof ApiError && error.status === 502 && tentativasFalhas < MAXIMO_DE_REPETICOES

export const createQueryClient = ({ retryDelay = ESPERA_PADRAO_EM_MS }: Options = {}): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: deveRepetir, retryDelay },
    },
  })
