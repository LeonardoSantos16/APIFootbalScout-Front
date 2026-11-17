import type { ReactNode } from 'react'
import styles from './Notice.module.css'

interface NoticeProps {
  children: ReactNode
}

export const Notice = ({ children }: NoticeProps) => (
  <p className={styles.notice} role="status">
    {children}
  </p>
)
