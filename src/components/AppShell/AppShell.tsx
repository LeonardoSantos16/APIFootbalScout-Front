import { MagnifyingGlassIcon, SignOutIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Skeleton } from '../Skeleton/Skeleton'
import styles from './AppShell.module.css'

export const APP_NAME = 'APIFootballScout'

const LINKS = ['Acompanhamentos', 'Shortlists', 'Relatórios']

interface AppShellProps {
  children?: ReactNode
  accountLink?: ReactNode
  onSignOut?: () => void
  loading?: boolean
}

export const AppShell = ({ children, accountLink, onSignOut, loading }: AppShellProps) => (
  <>
    <header className={styles.top} aria-busy={loading || undefined}>
      <span className={styles.brand}>{APP_NAME}</span>
      {loading ? (
        <>
          <Skeleton className={styles.searchSkeleton} />
          <div className={styles.links} aria-hidden>
            <Skeleton className={styles.linkSkeletonWide} />
            <Skeleton className={styles.linkSkeleton} />
            <Skeleton className={styles.linkSkeleton} />
          </div>
          <div className={styles.account} aria-hidden>
            <Skeleton className={styles.nameSkeleton} />
            <Skeleton className={styles.signOutSkeleton} />
          </div>
        </>
      ) : (
        <>
          <div className={styles.search} role="search">
            <MagnifyingGlassIcon size={20} aria-hidden />
            <span>Buscar jogador</span>
          </div>
          <nav aria-label="Principal">
            <ul className={styles.links}>
              {LINKS.map((link) => (
                <li key={link} className={styles.link}>
                  {link}
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.account}>
            {accountLink && <span className={styles.name}>{accountLink}</span>}
            <Button variant="ghost" className={styles.signOut} onClick={onSignOut}>
              <SignOutIcon size={20} aria-hidden />
              Sair
            </Button>
          </div>
        </>
      )}
      <Button variant="ghost" className={styles.menu}>
        Menu
      </Button>
    </header>
    <main className={styles.main}>{children}</main>
  </>
)
