import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import styles from './MeasurementCard.module.css'

export const MeasurementCardSkeleton = () => (
  <article className={styles.card} aria-hidden>
    <Skeleton className={styles.titleSkeleton} />
    <Skeleton className={styles.valueSkeleton} />
  </article>
)