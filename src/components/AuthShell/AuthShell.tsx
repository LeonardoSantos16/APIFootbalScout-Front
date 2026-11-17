import type { ReactNode } from 'react'
import { APP_NAME } from '../AppShell/AppShell'
import styles from './AuthShell.module.css'

interface AuthShellProps {
  children: ReactNode
}

export const AuthShell = ({ children }: AuthShellProps) => (
  <>
    <header className={styles.top}>
      <span className={styles.brand}>{APP_NAME}</span>
    </header>
    <main className={styles.main}>
      <div className={styles.card}>{children}</div>
    </main>
  </>
)
