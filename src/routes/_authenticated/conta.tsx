import { createFileRoute } from '@tanstack/react-router'
import { useLeaveSession } from '../../hooks/useLeaveSession'
import { AccountPage } from '../../pages/account/AccountPage'

export const Route = createFileRoute('/_authenticated/conta')({
  component: AccountRoute,
})

function AccountRoute() {
  const { leave, signOut } = useLeaveSession()
  return <AccountPage onSignOutAll={() => signOut('all')} onAccountDeleted={() => leave('conta-excluida')} />
}
