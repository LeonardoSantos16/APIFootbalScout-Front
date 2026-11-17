import type { ReactNode } from 'react'
import { Skeleton } from '../Skeleton/Skeleton'
import styles from './ClubBand.module.css'

interface ClubBandProps {
  name?: string
  subtitle?: string
  action?: ReactNode
  loading?: boolean
}

export const ClubBand = ({ name, subtitle, action, loading }: ClubBandProps) => (
  <header className={styles.band} aria-busy={loading || undefined}>
    <div className={styles.text}>
      {loading ? (
        <>
          <Skeleton className={styles.nameSkeleton} />
          <Skeleton className={styles.subtitleSkeleton} />
        </>
      ) : (
        <>
          <h1 className={styles.name}>{name}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </>
      )}
    </div>
    {action}
  </header>
)
