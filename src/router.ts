import type { QueryClient } from '@tanstack/react-query'
import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { onSessionEnded } from './api/client'
import { startSessionSync } from './api/sessionSync'
import { routeTree } from './routeTree.gen'
import { scrollKey } from './utils/pageChange'

const PUBLIC_PATHS = ['/entrar', '/criar-conta']

interface AppRouterOptions {
  queryClient: QueryClient
  history?: RouterHistory
}

export const createAppRouter = ({ queryClient, history }: AppRouterOptions) =>
  createRouter({
    routeTree,
    context: { queryClient },
    history,
    notFoundMode: 'root',
    scrollRestoration: true,
    getScrollRestorationKey: (location) => scrollKey(location.pathname),
  })

export type AppRouter = ReturnType<typeof createAppRouter>

export const bindSession = (router: AppRouter, queryClient: QueryClient): (() => void) => {
  onSessionEnded((notice) => {
    const { pathname, href } = router.state.location
    queryClient.clear()
    void router.navigate({
      to: '/entrar',
      search: { redirecionar: PUBLIC_PATHS.includes(pathname) ? undefined : href, aviso: notice },
    })
  })

  return startSessionSync({
    onSignedOut: () => {
      queryClient.clear()
      void router.navigate({ to: '/entrar' })
    },
    onAccountChanged: () => window.location.reload(),
  })
}
