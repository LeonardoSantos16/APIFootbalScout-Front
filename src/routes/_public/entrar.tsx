import { createFileRoute } from '@tanstack/react-router'
import type { SignInSearch } from '../../interfaces/session'
import { SignInPage } from '../../pages/sign-in/SignInPage'
import { parseNotice } from '../../utils/accountErrors'

export const Route = createFileRoute('/_public/entrar')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirecionar: typeof search.redirecionar === 'string' ? search.redirecionar : undefined,
    aviso: parseNotice(search.aviso),
  }),
  component: SignInRoute,
})

function SignInRoute() {
  const { aviso } = Route.useSearch()
  return <SignInPage notice={aviso} />
}
