import { Select } from '../../../../components/Select/Select'
import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import styles from './AddToShortlist.module.css'

const LOADING = 'Carregando shortlists'

export const AddToShortlistSkeleton = () => (
  <div className={styles.body} role="status" aria-label={LOADING}>
    <Select label="Shortlist" options={[]} loading />
    <Skeleton className={styles.skeletonField} />
    <Select label="Prioridade" options={[]} loading />
  </div>
)
