import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { isRefreshTokenExpired, readSession } from '../api/session'
import { AuthShell } from '../components/AuthShell/AuthShell'

export const Route = createFileRoute('/_public')({
  beforeLoad: () => {
    const session = readSession()
    if (session && !isRefreshTokenExpired(session, new Date())) throw redirect({ to: '/' })
  },
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <AuthShell>
      <Outlet />
    </AuthShell>
  )
}
