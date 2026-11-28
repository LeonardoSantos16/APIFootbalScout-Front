import { SignOutIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Dialog } from '../Dialog/Dialog'
import styles from './PhoneMenu.module.css'

export type MenuTarget = 'home' | 'shortlists' | 'account'

export interface MenuLinkProps {
  className: string
  onClick: () => void
  children: ReactNode
}

export type MenuLinkRenderer = (target: MenuTarget, props: MenuLinkProps) => ReactNode

interface PhoneMenuProps {
  open: boolean
  accountName?: string
  renderLink: MenuLinkRenderer
  onClose: () => void
  onSignOut: () => void
}

const ACCOUNT_LABEL = 'Conta'

export const PhoneMenu = ({ open, accountName, renderLink, onClose, onSignOut }: PhoneMenuProps) => {
  const link = (target: MenuTarget, children: ReactNode) => (
    <li className={styles.item}>{renderLink(target, { className: styles.link, onClick: onClose, children })}</li>
  )

  return (
    <Dialog open={open} variant="sheet" title="Menu" onClose={onClose}>
      <nav aria-label="Menu">
        <ul className={styles.list}>
          {link('home', 'Início')}
          {link('shortlists', 'Shortlists')}
          {link(
            'account',
            <span className={styles.account}>
              <span>{accountName}</span>
              <span className={styles.accountHint}>{ACCOUNT_LABEL}</span>
            </span>,
          )}
        </ul>
      </nav>
      <div>
        <Button variant="ghost" className={styles.signOut} onClick={onSignOut}>
          <SignOutIcon size={20} aria-hidden />
          Sair
        </Button>
      </div>
    </Dialog>
  )
}
