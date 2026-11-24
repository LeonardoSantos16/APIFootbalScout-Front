import type { Measurement } from '../../interfaces/tracking'
import { MeasurementBody } from './MeasurementBody'
import styles from './MeasurementCard.module.css'


export const MeasurementCard = (measurement: Measurement) => (
  <article
    className={[styles.card, measurement.state === 'Indisponivel' && styles.unavailable].filter(Boolean).join(' ')}
    aria-label={measurement.title}
  >
    <h3 className={styles.title}>{measurement.title}</h3>
    <MeasurementBody {...measurement} />
  </article>
)
