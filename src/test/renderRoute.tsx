import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { createQueryClient } from '../api/queryClient'
import { clearSession, saveSession } from '../api/session'
import { seedSession } from '../mocks/authStore'
import { routeTree } from '../routeTree.gen'

interface RenderRouteOptions {
  session?: 'signed-in' | 'signed-out'
}

export const renderRoute = (url: string, { session = 'signed-in' }: RenderRouteOptions = {}) => {
  if (session === 'signed-in') saveSession(seedSession())
  else clearSession()

  const queryClient = createQueryClient({ retryDelay: 0 })
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [url] }),
    context: { queryClient },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, queryClient }
}
