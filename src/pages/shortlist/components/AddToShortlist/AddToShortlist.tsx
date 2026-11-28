import { PlusIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Dialog } from '../../../../components/Dialog/Dialog'
import { usePlayerProfile } from '../../../../hooks/usePlayerProfile'
import styles from './AddToShortlist.module.css'
import { AddToShortlistContent } from './AddToShortlistContent'
import type { ShortlistLinkProps } from '../../interfaces/shortlist'

const OPEN_LABEL = 'Adicionar à shortlist'

export interface AddToShortlistProps {
  playerId: number
  renderShortlistLink: (shortlistId: string, props: ShortlistLinkProps) => ReactNode
}

export const AddToShortlist = ({ playerId, renderShortlistLink }: AddToShortlistProps) => {
  const [open, setOpen] = useState(false)
  const profile = usePlayerProfile(playerId)
  const name = profile.data?.details?.name ?? ''

  return (
    <>
      <Button variant="secondary" className={styles.open} onClick={() => setOpen(true)}>
        <PlusIcon size={20} aria-hidden />
        {OPEN_LABEL}
      </Button>
      <Dialog open={open} title={OPEN_LABEL} description={name} onClose={() => setOpen(false)}>
        <AddToShortlistContent
          playerId={playerId}
          playerName={name}
          marketValue={profile.data?.details?.proposedMarketValueRaw}
          onClose={() => setOpen(false)}
          renderShortlistLink={renderShortlistLink}
        />
      </Dialog>
    </>
  )
}
