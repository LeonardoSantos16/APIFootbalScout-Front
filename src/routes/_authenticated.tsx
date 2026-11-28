import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { $api } from '../api/client'
import { describeError } from '../api/errors'
import { clearSession, isRefreshTokenExpired, readSession } from '../api/session'
import { AppShell } from '../components/AppShell/AppShell'
import type { MenuLinkRenderer } from '../components/AppShell/PhoneMenu'
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch'
import { InlineError } from '../components/InlineError/InlineError'
import { useLeaveSession } from '../hooks/useLeaveSession'
import { useSession } from '../hooks/useSession'
import { APP_NAME } from '../utils/documentTitle'

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

const SEARCH_PATH = '/busca'

const ShortlistsLink = () => <Link to="/shortlists">Shortlists</Link>

const HomeLink = () => <Link to="/">{APP_NAME}</Link>

const MENU_PATH = { home: '/', shortlists: '/shortlists', account: '/conta' } as const

const renderMenuLink: MenuLinkRenderer = (target, { className, onClick, children }) => (
  <Link to={MENU_PATH[target]} activeOptions={{ exact: target === 'home' }} className={className} onClick={onClick}>
    {children}
  </Link>
)

const shellLinks = (name: string | undefined) => ({
  homeLink: <HomeLink />,
  accountLink: <AccountLink />,
  accountName: name,
  shortlistsLink: <ShortlistsLink />,
  renderMenuLink,
})

function AuthenticatedLayout() {
  const { signOut } = useLeaveSession()
  const session = useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const onSearchPage = pathname === SEARCH_PATH

  return (
    <AppShell
      {...shellLinks(session?.name)}
      onSignOut={() => signOut('device')}
      search={onSearchPage ? undefined : <HeaderSearch key={pathname} />}
      searchLink={onSearchPage ? undefined : <Link to={SEARCH_PATH}>Buscar</Link>}
    >
      <Outlet />
    </AppShell>
  )
}

function AuthenticatedError({ error }: ErrorComponentProps) {
  const router = useRouter()
  const { message, canRetry } = describeError(error)
  const { signOut } = useLeaveSession()
  const session = useSession()

  return (
    <AppShell {...shellLinks(session?.name)} onSignOut={() => signOut('device')}>
      <InlineError message={message} onRetry={canRetry ? () => void router.invalidate() : undefined} />
    </AppShell>
  )
}
