import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import styles from './MetricCell.module.css'

export type MetricCellProps = { label: string } & (
  | { state: 'loading' }
  | { state: 'calculated'; value: string; sample?: string }
  | { state: 'refused'; reason: string }
)

export const MetricCell = (props: MetricCellProps) => (
  <div
    className={[styles.cell, props.state === 'refused' && styles.refused].filter(Boolean).join(' ')}
    aria-busy={props.state === 'loading' || undefined}
  >
    {props.state === 'loading' && <Skeleton className={styles.skeleton} />}
    {props.state === 'calculated' && <span className={styles.value}>{props.value}</span>}
    {props.state === 'refused' && <span className={styles.reason}>{props.reason}</span>}
    <span className={styles.label}>{props.label}</span>
    {props.state === 'calculated' && props.sample && <span className={styles.sample}>{props.sample}</span>}
  </div>
)
