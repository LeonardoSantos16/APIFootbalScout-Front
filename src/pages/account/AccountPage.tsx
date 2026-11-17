import { useEffect } from 'react'
import { useSession } from '../../hooks/useSession'
import styles from './AccountPage.module.css'
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

  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

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
