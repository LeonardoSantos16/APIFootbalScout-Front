import { useEffect, useEffectEvent, useMemo } from 'react'
import { describeError } from '../../api/errors'
import { Card } from '../../components/Card/Card'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { Select } from '../../components/Select/Select'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import type { Slice, SliceSearch } from '../../interfaces/slice'
import { deriveSlices, findSlice, sliceLabel } from '../../utils/slice'
import { MetricsGrid } from './components/MetricsGrid/MetricsGrid'
import { useMetricsPer90 } from './hooks/useMetricsPer90'
import styles from './MetricsPage.module.css'
import { footerText } from './utils/metrics'

const PAGE_TITLE = 'Métricas por 90'
const SELECT_LABEL = 'Competição e temporada'

export interface SliceChangeOptions {
  replace?: boolean
}

export interface MetricsPageProps {
  playerId: number
  search: SliceSearch
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void
}

const sliceKey = (slice: Slice) => `${slice.competitionId}-${slice.seasonId}-${slice.context}`

export const MetricsPage = ({ playerId, search, onSliceChange }: MetricsPageProps) => {
  const profile = usePlayerProfile(playerId)
  const slices = useMemo(() => (profile.data ? deriveSlices(profile.data) : []), [profile.data])
  const selected = findSlice(slices, search)
  const fallback = slices[0]
  const shouldCorrect = !selected && fallback !== undefined
  const metrics = useMetricsPer90(playerId, selected)
  const name = profile.data?.details?.name

  const correctSlice = useEffectEvent(() => {
    if (fallback) onSliceChange(fallback, { replace: true })
  })

  useEffect(() => {
    if (shouldCorrect) correctSlice()
  }, [shouldCorrect])

  useEffect(() => {
    document.title = name ? `${PAGE_TITLE} · ${name}` : PAGE_TITLE
  }, [name])

  if (!profile.data) {
    return (
      <PageColumns>
        <Card title={PAGE_TITLE}>
          <div className={styles.content}>
            <Select label={SELECT_LABEL} options={[]} loading />
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

  const current = selected ?? fallback
  const options = slices.map((slice) => ({ value: sliceKey(slice), label: sliceLabel(slice, slices) }))
  const handleChange = (key: string) => {
    const slice = slices.find((item) => sliceKey(item) === key)
    if (slice) onSliceChange(slice)
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
          <Select label={SELECT_LABEL} options={options} value={sliceKey(current)} onChange={handleChange} />
          {renderMetrics()}
        </div>
      </Card>
    </PageColumns>
  )
}
