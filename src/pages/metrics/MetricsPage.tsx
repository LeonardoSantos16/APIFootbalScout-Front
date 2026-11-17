import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { describeError } from '../../api/errors'
import { Card } from '../../components/Card/Card'
import { ClubBand } from '../../components/ClubBand/ClubBand'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { Select } from '../../components/Select/Select'
import { Tabs } from '../../components/Tabs/Tabs'
import { usePlayerProfile } from '../../hooks/usePlayerProfile'
import type { Slice, SliceSearch } from '../../interfaces/slice'
import { playerSummary } from '../../utils/player'
import { deriveSlices, findSlice, sliceLabel } from '../../utils/slice'
import { MetricsGrid } from './components/MetricsGrid/MetricsGrid'
import { useMetricsPer90 } from './hooks/useMetricsPer90'
import styles from './MetricsPage.module.css'
import { footerText } from './utils/metrics'

const PAGE_TITLE = 'Métricas por 90'
const SELECT_LABEL = 'Competição e temporada'
const TABS = [{ id: 'metrics', label: PAGE_TITLE }]

export interface SliceChangeOptions {
  replace?: boolean
}

export interface MetricsPageProps {
  playerId: number
  search: SliceSearch
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void
}

const sliceKey = (slice: Slice) => `${slice.competitionId}-${slice.seasonId}-${slice.context}`

const PlayerTabs = () => <Tabs items={TABS} value="metrics" ariaLabel="Abas do jogador" />

export const MetricsPage = ({ playerId, search, onSliceChange }: MetricsPageProps) => {
  const [today] = useState(() => new Date())
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

  if (profile.isError && !profile.isFetching) {
    const { message, canRetry } = describeError(profile.error, { plainText: true })
    return (
      <PageColumns>
        <Card title={PAGE_TITLE}>
          <InlineError message={message} onRetry={canRetry ? () => profile.refetch() : undefined} />
        </Card>
      </PageColumns>
    )
  }

  if (!profile.data) {
    return (
      <PageColumns>
        <Card header={<ClubBand loading />}>
          <div className={styles.content}>
            <PlayerTabs />
            <Select label={SELECT_LABEL} options={[]} loading />
            <MetricsGrid footnote={footerText()} />
          </div>
        </Card>
      </PageColumns>
    )
  }

  const details = profile.data.details
  const header = (
    <ClubBand name={name ?? ''} subtitle={details ? playerSummary(details, today) : undefined} />
  )

  if (slices.length === 0) {
    return (
      <PageColumns>
        <Card header={header}>
          <div className={styles.content}>
            <PlayerTabs />
            <p className={styles.empty}>Sem estatísticas publicadas para este jogador.</p>
          </div>
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
      <Card header={header}>
        <div className={styles.content}>
          <PlayerTabs />
          <Select label={SELECT_LABEL} options={options} value={sliceKey(current)} onChange={handleChange} />
          {renderMetrics()}
        </div>
      </Card>
    </PageColumns>
  )
}
