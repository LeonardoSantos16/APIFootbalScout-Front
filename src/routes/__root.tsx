import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { AppShell } from '../components/AppShell/AppShell'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: Root,
})

function Root() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
