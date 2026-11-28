import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { AppShell } from '../components/AppShell/AppShell'
import type { MenuLinkRenderer } from '../components/AppShell/PhoneMenu'
import { useLeaveSession } from '../hooks/useLeaveSession'
import { useSession } from '../hooks/useSession'
import { APP_NAME } from '../utils/documentTitle'

const MENU_PATH = { home: '/', shortlists: '/shortlists', account: '/conta' } as const

const renderMenuLink: MenuLinkRenderer = (target, { className, onClick, children }) => (
  <Link to={MENU_PATH[target]} activeOptions={{ exact: target === 'home' }} className={className} onClick={onClick}>
    {children}
  </Link>
)

interface AuthenticatedShellProps {
  children?: ReactNode
  search?: ReactNode
  searchLink?: ReactNode
}

export const AuthenticatedShell = ({ children, search, searchLink }: AuthenticatedShellProps) => {
  const session = useSession()
  const { signOut } = useLeaveSession()

  return (
    <AppShell
      homeLink={<Link to="/">{APP_NAME}</Link>}
      accountLink={session ? <Link to="/conta">{session.name}</Link> : undefined}
      accountName={session?.name}
      shortlistsLink={<Link to="/shortlists">Shortlists</Link>}
      renderMenuLink={renderMenuLink}
      onSignOut={() => signOut('device')}
      search={search}
      searchLink={searchLink}
    >
      {children}
    </AppShell>
  )
}
