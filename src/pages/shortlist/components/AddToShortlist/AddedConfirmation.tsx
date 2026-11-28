import { CheckIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '../../../../components/Button/Button'
import { linkButtonClassName } from '../../../../components/Button/buttonClassName'
import type { AddedTarget } from '../../hooks/useAddToShortlistForm'
import type { ShortlistLinkProps } from '../../interfaces/shortlist'
import styles from './AddToShortlist.module.css'

const CLOSE = 'Fechar'
const SEE_SHORTLIST = 'Ver shortlist'

interface AddedConfirmationProps {
  added: AddedTarget
  onClose: () => void
  renderShortlistLink: (shortlistId: string, props: ShortlistLinkProps) => ReactNode
}

export const AddedConfirmation = ({ added, onClose, renderShortlistLink }: AddedConfirmationProps) => (
  <div className={styles.body}>
    <p className={styles.added} role="status">
      <CheckIcon className={styles.check} size={20} aria-hidden />
      {added.message}
    </p>
    <div className={styles.actions}>
      <Button variant="secondary" onClick={onClose}>
        {CLOSE}
      </Button>
      {renderShortlistLink(added.shortlistId, { className: linkButtonClassName('primary'), children: SEE_SHORTLIST })}
    </div>
  </div>
)
