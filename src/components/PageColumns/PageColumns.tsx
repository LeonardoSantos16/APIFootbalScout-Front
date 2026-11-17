import type { ReactNode } from 'react'
import styles from './PageColumns.module.css'

interface PageColumnsProps {
  children: ReactNode
  aside?: ReactNode
}

export const PageColumns = ({ children, aside }: PageColumnsProps) => (
  <div className={styles.columns}>
    <div>{children}</div>
    <aside className={styles.aside}>{aside}</aside>
  </div>
)
