import type { ReactNode } from 'react'
import styles from './ShortlistMessage.module.css'

interface ShortlistMessageProps {
  text: string
  action?: ReactNode
}

export const ShortlistMessage = ({ text, action }: ShortlistMessageProps) => (
  <div className={styles.message}>
    <p className={styles.text}>{text}</p>
    {action && <div>{action}</div>}
  </div>
)
