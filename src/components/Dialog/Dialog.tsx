import * as RadixDialog from '@radix-ui/react-dialog'
import { XIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import styles from './Dialog.module.css'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  actions?: ReactNode
  children?: ReactNode
}

export const Dialog = ({ open, title, description, onClose, actions, children }: DialogProps) => (
  <RadixDialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles.backdrop} />
      <RadixDialog.Content className={styles.dialog} {...(description ? {} : { 'aria-describedby': undefined })}>
        <div className={styles.head}>
          <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
          <RadixDialog.Close className={styles.close} aria-label="Fechar">
            <XIcon size={20} aria-hidden />
          </RadixDialog.Close>
        </div>
        {description && <RadixDialog.Description className={styles.description}>{description}</RadixDialog.Description>}
        {children}
        {actions && <div className={styles.actions}>{actions}</div>}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
)
