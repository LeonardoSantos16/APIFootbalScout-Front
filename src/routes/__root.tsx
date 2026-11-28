import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { usePageFocus } from '../hooks/usePageFocus'
import { NotFoundRoute } from './-NotFoundRoute'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFoundRoute,
})

function RootLayout() {
  usePageFocus()
  return <Outlet />
}
