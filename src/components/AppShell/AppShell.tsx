import { SignOutIcon } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { APP_NAME } from '../../utils/documentTitle'
import { Button } from '../Button/Button'
import { Skeleton } from '../Skeleton/Skeleton'
import { MAIN_CONTENT_ID } from '../SkipLink/mainContent'
import { SkipLink } from '../SkipLink/SkipLink'
import { PhoneMenu, type MenuLinkRenderer } from './PhoneMenu'
import styles from './AppShell.module.css'

interface AppShellProps {
  children?: ReactNode
  homeLink?: ReactNode
  accountLink?: ReactNode
  accountName?: string
  onSignOut?: () => void
  loading?: boolean
  search?: ReactNode
  searchLink?: ReactNode
  shortlistsLink?: ReactNode
  renderMenuLink?: MenuLinkRenderer
}

export const AppShell = ({
  children,
  homeLink,
  accountLink,
  accountName,
  onSignOut,
  loading,
  search,
  searchLink,
  shortlistsLink,
  renderMenuLink,
}: AppShellProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <SkipLink />
      <header className={styles.top} aria-busy={loading || undefined}>
        <span className={styles.brand}>{homeLink ?? APP_NAME}</span>
        {loading ? (
          <>
            <Skeleton className={styles.searchSkeleton} />
            <div className={styles.links} aria-hidden>
              <Skeleton className={styles.linkSkeleton} />
            </div>
            <div className={styles.account} aria-hidden>
              <Skeleton className={styles.nameSkeleton} />
              <Skeleton className={styles.signOutSkeleton} />
            </div>
          </>
        ) : (
          <>
            {search && <div className={styles.search}>{search}</div>}
            {shortlistsLink && (
              <nav aria-label="Principal">
                <ul className={styles.links}>
                  <li className={styles.link}>{shortlistsLink}</li>
                </ul>
              </nav>
            )}
            <div className={styles.account}>
              {accountLink && <span className={styles.name}>{accountLink}</span>}
              <Button variant="ghost" className={styles.signOut} onClick={onSignOut}>
                <SignOutIcon size={20} aria-hidden />
                Sair
              </Button>
            </div>
          </>
        )}
        <div className={styles.phone}>
          {!loading && searchLink && <span className={styles.searchLink}>{searchLink}</span>}
          <Button
            variant="ghost"
            className={styles.menuButton}
            aria-haspopup="dialog"
            disabled={loading || !renderMenuLink}
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </Button>
        </div>
      </header>
      {renderMenuLink && (
        <PhoneMenu
          open={menuOpen}
          accountName={accountName}
          renderLink={renderMenuLink}
          onClose={() => setMenuOpen(false)}
          onSignOut={() => {
            setMenuOpen(false)
            onSignOut?.()
          }}
        />
      )}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
        {children}
      </main>
    </>
  )
}
