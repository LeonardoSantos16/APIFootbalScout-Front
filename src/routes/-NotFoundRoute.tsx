import { Link } from '@tanstack/react-router'
import { isRefreshTokenExpired, readSession } from '../api/session'
import { AuthShell } from '../components/AuthShell/AuthShell'
import { linkButtonClassName } from '../components/Button/buttonClassName'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'
import { AuthenticatedShell } from './-AuthenticatedShell'

const hasSession = () => {
  const session = readSession()
  return session !== null && !isRefreshTokenExpired(session, new Date())
}

export const NotFoundRoute = () =>
  hasSession() ? (
    <AuthenticatedShell>
      <NotFoundPage
        framed
        action={
          <Link to="/" className={linkButtonClassName('secondary')}>
            Ir para o início
          </Link>
        }
      />
    </AuthenticatedShell>
  ) : (
    <AuthShell>
      <NotFoundPage
        action={
          <Link to="/entrar" className={linkButtonClassName('primary')}>
            Entrar
          </Link>
        }
      />
    </AuthShell>
  )
