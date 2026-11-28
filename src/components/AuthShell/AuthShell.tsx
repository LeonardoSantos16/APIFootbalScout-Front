import type { ReactNode } from 'react'
import { APP_NAME } from '../../utils/documentTitle'
import { MAIN_CONTENT_ID } from '../SkipLink/mainContent'
import { SkipLink } from '../SkipLink/SkipLink'
import styles from './AuthShell.module.css'

interface AuthShellProps {
  children: ReactNode
}

export const AuthShell = ({ children }: AuthShellProps) => (
  <>
    <SkipLink />
    <header className={styles.top}>
      <span className={styles.brand}>{APP_NAME}</span>
    </header>
    <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
      <div className={styles.card}>{children}</div>
    </main>
  </>
)
