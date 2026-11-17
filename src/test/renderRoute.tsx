import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { onTestFinished } from 'vitest'
import { createQueryClient } from '../api/queryClient'
import { clearSession, saveSession } from '../api/session'
import type { AuthResponse } from '../interfaces/session'
import { seedSession } from '../mocks/authStore'
import { bindSession, createAppRouter } from '../router'

interface RenderRouteOptions {
  session?: 'signed-in' | 'signed-out' | AuthResponse
}

export const renderRoute = (url: string, { session = 'signed-in' }: RenderRouteOptions = {}) => {
  if (session === 'signed-out') clearSession()
  else saveSession(session === 'signed-in' ? seedSession() : session)

  const queryClient = createQueryClient({ retryDelay: 0 })
  const router = createAppRouter({ queryClient, history: createMemoryHistory({ initialEntries: [url] }) })
  onTestFinished(bindSession(router, queryClient))

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}
