import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createQueryClient } from './api/queryClient'
import { bindSession, createAppRouter, type AppRouter } from './router'
import './styles/global.css'

const queryClient = createQueryClient()

const router = createAppRouter({ queryClient })

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}

const startMocks = async () => {
  if (import.meta.env.VITE_API_MOCK !== 'true') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

await startMocks()

bindSession(router, queryClient)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
