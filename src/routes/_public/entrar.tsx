import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import type { SignInSearch } from '../../interfaces/session'
import { SignInPage } from '../../pages/sign-in/SignInPage'
import { parseNotice } from '../../utils/accountErrors'
import { safeRedirect } from '../../utils/redirect'

export const Route = createFileRoute('/_public/entrar')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirecionar: typeof search.redirecionar === 'string' ? search.redirecionar : undefined,
    aviso: parseNotice(search.aviso),
  }),
  component: SignInRoute,
})

function SignInRoute() {
  const { aviso, redirecionar } = Route.useSearch()
  const router = useRouter()

  return (
    <SignInPage
      notice={aviso}
      onSignedIn={() => router.history.push(safeRedirect(redirecionar))}
      signUpLink={
        <Link to="/criar-conta" search={{ redirecionar }}>
          Criar conta
        </Link>
      }
    />
  )
}
