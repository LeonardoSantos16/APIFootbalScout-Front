import { useState, type ReactNode } from 'react'
import { InlineError } from '../../../../components/InlineError/InlineError'
import { useShortlists } from '../../../../hooks/useShortlists'
import type { MarketValue, ShortlistResponse, ShortlistLinkProps } from '../../interfaces/shortlist'
import { withCreated } from '../../utils/addForm'
import { writeErrorText } from '../../utils/shortlistError'
import { AddTargetPanel } from './AddTargetPanel'
import { AddToShortlistSkeleton } from './AddToShortlistSkeleton'
import { FirstShortlist } from './FirstShortlist'

interface AddToShortlistContentProps {
  playerId: number
  playerName: string
  marketValue?: MarketValue | null
  onClose: () => void
  renderShortlistLink: (shortlistId: string, props: ShortlistLinkProps) => ReactNode
}

export const AddToShortlistContent = ({
  playerId,
  playerName,
  marketValue,
  onClose,
  renderShortlistLink,
}: AddToShortlistContentProps) => {
  const shortlists = useShortlists({ fresh: true })
  const [created, setCreated] = useState<ShortlistResponse>()

  if (shortlists.isError && !shortlists.isFetching && !shortlists.data) {
    return <InlineError message={writeErrorText(shortlists.error, 'dialog')} onRetry={() => void shortlists.refetch()} />
  }
  if (!shortlists.data || !shortlists.isFetchedAfterMount) return <AddToShortlistSkeleton />

  const list = withCreated(shortlists.data, created)
  if (list.length === 0) return <FirstShortlist playerName={playerName} onCreated={setCreated} />

  return (
    <AddTargetPanel
      shortlists={list}
      playerId={playerId}
      marketValue={marketValue}
      initialShortlistId={created?.shortlistId}
      onClose={onClose}
      renderShortlistLink={renderShortlistLink}
    />
  )
}
