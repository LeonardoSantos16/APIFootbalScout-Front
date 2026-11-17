import type { MetricRow } from '../../interfaces/metrics'
import { ATTRIBUTE_LABEL, ATTRIBUTE_ORDER } from '../../utils/metrics'
import { MetricCell, type MetricCellProps } from '../MetricCell/MetricCell'
import styles from './MetricsGrid.module.css'

interface MetricsGridProps {
  rows?: MetricRow[]
  footnote: string
}

const toCell = (row: MetricRow): MetricCellProps =>
  row.refused
    ? { state: 'refused', label: row.label, reason: row.text }
    : { state: 'calculated', label: row.label, value: row.text, sample: row.sample }

const loadingCells: MetricCellProps[] = ATTRIBUTE_ORDER.map((type) => ({
  state: 'loading',
  label: ATTRIBUTE_LABEL[type],
}))

export const MetricsGrid = ({ rows, footnote }: MetricsGridProps) => {
  const cells = rows ? rows.map(toCell) : loadingCells

  return (
    <div>
      <div className={styles.grid}>
        {cells.map((cell) => (
          <MetricCell key={cell.label} {...cell} />
        ))}
      </div>
      <p className={styles.footnote}>{footnote}</p>
    </div>
  )
}
