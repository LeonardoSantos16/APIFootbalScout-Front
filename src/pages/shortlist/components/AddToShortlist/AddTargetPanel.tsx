import type { ReactNode } from 'react'
import { useAddToShortlistForm } from '../../hooks/useAddToShortlistForm'
import type { MarketValue, ShortlistResponse, ShortlistLinkProps } from '../../interfaces/shortlist'
import { AddTargetForm } from './AddTargetForm'
import { AddedConfirmation } from './AddedConfirmation'

interface AddTargetPanelProps {
  shortlists: ShortlistResponse[]
  playerId: number
  marketValue?: MarketValue | null
  initialShortlistId?: string
  onClose: () => void
  renderShortlistLink: (shortlistId: string, props: ShortlistLinkProps) => ReactNode
}

export const AddTargetPanel = ({
  shortlists,
  playerId,
  marketValue,
  initialShortlistId,
  onClose,
  renderShortlistLink,
}: AddTargetPanelProps) => {
  const { added, ...form } = useAddToShortlistForm(shortlists, playerId, marketValue, initialShortlistId)

  return added ? (
    <AddedConfirmation added={added} onClose={onClose} renderShortlistLink={renderShortlistLink} />
  ) : (
    <AddTargetForm {...form} onCancel={onClose} />
  )
}
