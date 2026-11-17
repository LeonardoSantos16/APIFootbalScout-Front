import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import type { SignUpSearch } from '../../interfaces/session'
import { SignUpPage } from '../../pages/sign-up/SignUpPage'
import { safeRedirect } from '../../utils/redirect'

export const Route = createFileRoute('/_public/criar-conta')({
  validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
    redirecionar: typeof search.redirecionar === 'string' ? search.redirecionar : undefined,
  }),
  component: SignUpRoute,
})

function SignUpRoute() {
  const { redirecionar } = Route.useSearch()
  const router = useRouter()

  return (
    <SignUpPage
      onSignedUp={() => router.history.push(safeRedirect(redirecionar))}
      signInLink={
        <Link to="/entrar" search={{ redirecionar }}>
          Entrar
        </Link>
      }
    />
  )
}
