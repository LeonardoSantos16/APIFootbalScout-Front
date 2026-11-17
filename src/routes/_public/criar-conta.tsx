import { createFileRoute } from '@tanstack/react-router'
import type { SignUpSearch } from '../../interfaces/session'
import { SignUpPage } from '../../pages/sign-up/SignUpPage'

export const Route = createFileRoute('/_public/criar-conta')({
  validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
    redirecionar: typeof search.redirecionar === 'string' ? search.redirecionar : undefined,
  }),
  component: SignUpPage,
})
