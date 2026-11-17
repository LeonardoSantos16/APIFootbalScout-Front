import styles from './Skeleton.module.css'

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <span className={[styles.skeleton, className].filter(Boolean).join(' ')} aria-hidden />
)
