import type { MouseEvent } from 'react'
import { MAIN_CONTENT_ID } from './mainContent'
import styles from './SkipLink.module.css'

const LABEL = 'Pular para o conteúdo'

const focusMain = (event: MouseEvent<HTMLAnchorElement>) => {
  const main = document.getElementById(MAIN_CONTENT_ID)
  if (!main) return
  event.preventDefault()
  main.focus()
}

export const SkipLink = () => (
  <a className={styles.skipLink} href={`#${MAIN_CONTENT_ID}`} onClick={focusMain}>
    {LABEL}
  </a>
)
