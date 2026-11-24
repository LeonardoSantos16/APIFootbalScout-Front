import { ChangeChip } from '../../../../components/ChangeChip/ChangeChip'
import type { Measurement } from '../../interfaces/tracking'
import styles from './MeasurementCard.module.css'
const NO_RELEVANT_CHANGE = 'Sem mudança relevante'

export const MeasurementBody = ({ state, previous, current, change, reason }: Measurement) => {
  if (state === 'Indisponivel') return reason ? <p className={styles.reason}>{reason}</p> : null

  if (state === 'SemMudancaRelevante') {
    return (
      <>
        {current && <p className={[styles.values, styles.muted].join(' ')}>{current}</p>}
        <p className={styles.note}>{NO_RELEVANT_CHANGE}</p>
      </>
    )
  }

  return (
    <>
      <p className={styles.values}>
        {previous && (
          <>
            <span className={styles.previous}>{previous}</span>
            <span className={styles.arrow}> → </span>
          </>
        )}
        <span>{current}</span>
      </p>
      {change && <ChangeChip direction={change.direction}>{change.text}</ChangeChip>}
    </>
  )
}