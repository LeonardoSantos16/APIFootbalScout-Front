import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import type { TrackingView } from '../../interfaces/tracking'
import { MeasurementCard } from '../MeasurementCard/MeasurementCard'
import { MeasurementCardSkeleton } from '../MeasurementCard/MeasurementCardSkeleton'
import styles from './TrackingPanel.module.css'

const TITLE = 'Acompanhamento'
const SKELETON_CARDS = ['clube', 'valor', 'minutagem']

interface TrackingPanelProps {
  view?: TrackingView
}

export const TrackingPanel = ({ view }: TrackingPanelProps) => (
  <section className={styles.panel} aria-busy={!view || undefined}>
    <div className={styles.head}>
      <h2 className={styles.title}>{TITLE}</h2>
      {view ? <p className={styles.window}>{view.window}</p> : <Skeleton className={styles.windowSkeleton} />}
    </div>
    <div className={styles.grid}>
      {view
        ? view.measurements.map((measurement) => <MeasurementCard key={measurement.title} {...measurement} />)
        : SKELETON_CARDS.map((key) => <MeasurementCardSkeleton key={key} />)}
    </div>
  </section>
)
