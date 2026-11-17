import { createFileRoute } from '@tanstack/react-router'
import { AccountPage } from '../../pages/account/AccountPage'

export const Route = createFileRoute('/_authenticated/conta')({
  component: AccountPage,
})
