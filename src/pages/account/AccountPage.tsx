import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useSession } from '../../hooks/useSession'
import styles from './AccountPage.module.css'
import { documentTitle } from '../../utils/documentTitle'
import { ChangePasswordCard } from './components/ChangePasswordCard'
import { DeleteAccountCard } from './components/DeleteAccountCard'
import { SessionsCard } from './components/SessionsCard'

const PAGE_TITLE = 'Conta'

interface AccountPageProps {
  onSignOutAll: () => void
  onAccountDeleted: () => void
}

export const AccountPage = ({ onSignOutAll, onAccountDeleted }: AccountPageProps) => {
  const session = useSession()

  useDocumentTitle(documentTitle(PAGE_TITLE))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{PAGE_TITLE}</h1>
        {session && (
          <p className={styles.identity}>
            {session.name} · {session.email}
          </p>
        )}
      </div>
      <ChangePasswordCard />
      <SessionsCard onSignOutAll={onSignOutAll} />
      <DeleteAccountCard email={session?.email ?? ''} onDeleted={onAccountDeleted} />
    </div>
  )
}
