import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  aside?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  flush?: boolean
  className?: string
  children?: ReactNode
}

export const Card = ({ title, subtitle, aside, header, footer, flush, className, children }: CardProps) => (
  <section className={[styles.card, className].filter(Boolean).join(' ')}>
    {header}
    {title && (
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {aside}
      </div>
    )}
    <div className={[styles.body, flush && styles.flush].filter(Boolean).join(' ')}>{children}</div>
    {footer && <div className={styles.foot}>{footer}</div>}
  </section>
)
