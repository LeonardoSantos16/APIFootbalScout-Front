import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AppShell } from '../components/AppShell/AppShell'
import type { MenuLinkRenderer } from '../components/AppShell/PhoneMenu'
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch'
import { useLeaveSession } from '../hooks/useLeaveSession'
import { useSession } from '../hooks/useSession'
import { APP_NAME } from '../utils/documentTitle'

const SEARCH_PATH = '/busca'

const MENU_PATH = { home: '/', shortlists: '/shortlists', account: '/conta' } as const

const renderMenuLink: MenuLinkRenderer = (target, { className, onClick, children }) => (
  <Link to={MENU_PATH[target]} activeOptions={{ exact: target === 'home' }} className={className} onClick={onClick}>
    {children}
  </Link>
)

interface AuthenticatedShellProps {
  children?: ReactNode
}

export const AuthenticatedShell = ({ children }: AuthenticatedShellProps) => {
  const session = useSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const onSearchPage = pathname === SEARCH_PATH
  const { signOut } = useLeaveSession()

  return (
    <AppShell
      homeLink={<Link to="/">{APP_NAME}</Link>}
      accountLink={session ? <Link to="/conta">{session.name}</Link> : undefined}
      accountName={session?.name}
      shortlistsLink={<Link to="/shortlists">Shortlists</Link>}
      renderMenuLink={renderMenuLink}
      onSignOut={() => signOut('device')}
      search={onSearchPage ? undefined : <HeaderSearch key={pathname} />}
      searchLink={onSearchPage ? undefined : <Link to={SEARCH_PATH}>Buscar</Link>}
    >
      {children}
    </AppShell>
  )
}
