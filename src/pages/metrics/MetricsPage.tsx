import { useEffect } from 'react'
import { describeError } from '../../api/errors'
import { Card } from '../../components/Card/Card'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { Select } from '../../components/Select/Select'
import { SLICE_SELECT_LABEL, useSliceSelection } from '../../hooks/useSliceSelection'
import type { Slice, SliceChangeOptions, SliceSearch } from '../../interfaces/slice'
import { MetricsGrid } from './components/MetricsGrid/MetricsGrid'
import { useMetricsPer90 } from './hooks/useMetricsPer90'
import styles from './MetricsPage.module.css'
import { footerText } from './utils/metrics'

const PAGE_TITLE = 'Métricas por 90'

export interface MetricsPageProps {
  playerId: number
  search: SliceSearch
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void
}

export const MetricsPage = ({ playerId, search, onSliceChange }: MetricsPageProps) => {
  const { profile, slices, selected, options, value, select } = useSliceSelection(playerId, search, onSliceChange)
  const metrics = useMetricsPer90(playerId, selected)
  const name = profile.data?.details?.name

  useEffect(() => {
    document.title = name ? `${PAGE_TITLE} · ${name}` : PAGE_TITLE
  }, [name])

  if (!profile.data) {
    return (
      <PageColumns>
        <Card title={PAGE_TITLE}>
          <div className={styles.content}>
            <Select label={SLICE_SELECT_LABEL} options={[]} loading />
            <MetricsGrid footnote={footerText()} />
          </div>
        </Card>
      </PageColumns>
    )
  }

  if (slices.length === 0) {
    return (
      <PageColumns>
        <Card title={PAGE_TITLE}>
          <p className={styles.empty}>Sem estatísticas publicadas para este jogador.</p>
        </Card>
      </PageColumns>
    )
  }

  const renderMetrics = () => {
    if (selected && metrics.isError && !metrics.isFetching) {
      const { message, canRetry } = describeError(metrics.error)
      return <InlineError message={message} onRetry={canRetry ? () => metrics.refetch() : undefined} />
    }
    const grid = selected ? metrics.data : undefined
    return <MetricsGrid rows={grid?.rows} footnote={grid?.footnote ?? footerText()} />
  }

  return (
    <PageColumns>
      <Card title={PAGE_TITLE}>
        <div className={styles.content}>
          <Select label={SLICE_SELECT_LABEL} options={options} value={value} onChange={select} />
          {renderMetrics()}
        </div>
      </Card>
    </PageColumns>
  )
}
