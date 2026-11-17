import { MagnifyingGlassIcon, SignOutIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import styles from './AppShell.module.css'

const APP_NAME = 'APIFootballScout'

const LINKS = ['Acompanhamentos', 'Shortlists', 'Relatórios']

interface AppShellProps {
  children?: ReactNode
}

export const AppShell = ({ children }: AppShellProps) => (
  <>
    <header className={styles.top}>
      <span className={styles.brand}>{APP_NAME}</span>
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
        <SignOutIcon size={20} aria-hidden />
        <span>Sair</span>
      </div>
      <Button variant="ghost" className={styles.menu}>
        Menu
      </Button>
    </header>
    <main className={styles.main}>{children}</main>
  </>
)
