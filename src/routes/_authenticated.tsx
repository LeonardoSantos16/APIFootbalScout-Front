import { Link, Outlet, createFileRoute, redirect, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { $api } from '../api/client'
import { describeError } from '../api/errors'
import { clearSession, isRefreshTokenExpired, readSession } from '../api/session'
import { AppShell } from '../components/AppShell/AppShell'
import { InlineError } from '../components/InlineError/InlineError'
import { useSession } from '../hooks/useSession'

const meQuery = $api.queryOptions('get', '/api/Auth/me')

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location, context }) => {
    const session = readSession()
    if (!session || isRefreshTokenExpired(session, new Date())) {
      clearSession()
      throw redirect({ to: '/entrar', search: { redirecionar: location.href } })
    }
    await context.queryClient.ensureQueryData(meQuery)
  },
  pendingMs: 0,
  pendingMinMs: 0,
  pendingComponent: () => <AppShell loading />,
  errorComponent: AuthenticatedError,
  component: AuthenticatedLayout,
})

const AccountLink = () => {
  const session = useSession()
  return session ? <Link to="/conta">{session.name}</Link> : null
}

function AuthenticatedLayout() {
  return (
    <AppShell accountLink={<AccountLink />}>
      <Outlet />
    </AppShell>
  )
}

function AuthenticatedError({ error }: ErrorComponentProps) {
  const router = useRouter()
  const { message, canRetry } = describeError(error)

  return (
    <AppShell accountLink={<AccountLink />}>
      <InlineError message={message} onRetry={canRetry ? () => void router.invalidate() : undefined} />
    </AppShell>
  )
}
