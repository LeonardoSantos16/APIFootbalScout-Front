import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import styles from './ReportTimeline.module.css'
const SKELETON_ROWS = 3

export const ReportTimelineSkeleton = () => (
  <div className={styles.timeline} aria-hidden>
    <ol className={styles.group}>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <li key={index} className={styles.item}>
          <span className={styles.row}>
            <span className={styles.main}>
              <Skeleton className={styles.skeletonTitle} />
              <Skeleton className={styles.skeletonDetail} />
            </span>
            <Skeleton className={styles.skeletonBadge} />
          </span>
        </li>
      ))}
    </ol>
  </div>
)
