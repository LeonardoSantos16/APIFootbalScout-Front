import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import styles from './TargetList.module.css'

const SKELETON_ROWS = 5

export const TargetListSkeleton = () => (
  <ol className={styles.list} aria-hidden>
    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
      <li key={index} className={[styles.item, styles.skeletonRow].join(' ')}>
        <Skeleton className={styles.skeletonPriority} />
        <Skeleton className={styles.skeletonPhoto} />
        <span className={styles.skeletonMain}>
          <Skeleton className={styles.skeletonName} />
          <Skeleton className={styles.skeletonDetail} />
        </span>
        <Skeleton className={styles.skeletonCost} />
      </li>
    ))}
  </ol>
)
