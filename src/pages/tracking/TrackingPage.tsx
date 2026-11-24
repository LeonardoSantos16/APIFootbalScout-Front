import { useEffect } from 'react'
import { Card } from '../../components/Card/Card'
import { InlineError } from '../../components/InlineError/InlineError'
import { PageColumns } from '../../components/PageColumns/PageColumns'
import { useSliceSelection } from '../../hooks/useSliceSelection'
import type { PlayerSearch, Slice, SliceChangeOptions } from '../../interfaces/slice'
import styles from './TrackingPage.module.css'
import { TrackingPanel } from './components/TrackingPanel/TrackingPanel'
import { TrackingStart } from './components/TrackingStart/TrackingStart'
import { useOpenTracking } from './hooks/useOpenTracking'
import { useTracking } from './hooks/useTracking'
import { describeOpeningError, describeReadingError } from './utils/trackingError'

const PAGE_TITLE = 'Acompanhamento'
const NO_STATS = 'Sem estatísticas publicadas para este jogador.'

export interface TrackingPageProps {
  playerId: number
  search: PlayerSearch
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void
}

export const TrackingPage = ({ playerId, search, onSliceChange }: TrackingPageProps) => {
  const { profile, slices, selected, options, value, select } = useSliceSelection(playerId, search, onSliceChange)
  const tracking = useTracking(playerId)
  const opening = useOpenTracking(playerId)
  const name = profile.data?.details?.name

  useEffect(() => {
    document.title = name ? `${PAGE_TITLE} · ${name}` : PAGE_TITLE
  }, [name])

  const renderContent = () => {
    if (tracking.isError && !tracking.isFetching) {
      const { message, canRetry } = describeReadingError(tracking.error)
      return (
        <Card title={PAGE_TITLE}>
          <InlineError message={message} onRetry={canRetry ? () => void tracking.refetch() : undefined} />
        </Card>
      )
    }

    if (!profile.data || tracking.data === undefined) return <TrackingPanel />

    if (tracking.data) return <TrackingPanel view={tracking.data} />

    if (slices.length === 0) {
      return (
        <Card title={PAGE_TITLE}>
          <p className={styles.empty}>{NO_STATS}</p>
        </Card>
      )
    }

    const open = () => {
      if (selected) opening.mutate(selected)
    }

    return (
      <Card title={PAGE_TITLE}>
        <TrackingStart
          options={options}
          value={value}
          onSelect={select}
          onOpen={open}
          opening={opening.isPending}
          failure={opening.isError ? describeOpeningError(opening.error) : undefined}
        />
      </Card>
    )
  }

  return <PageColumns>{renderContent()}</PageColumns>
}
