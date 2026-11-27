import type { ReactNode } from 'react'
import styles from './StatusBadge.module.css'

export type StatusTone = 'draft' | 'finalized' | 'current'

const LABEL: Record<StatusTone, string> = {
  draft: 'Rascunho',
  finalized: 'Finalizado',
  current: 'Vigente',
}

interface StatusBadgeProps {
  tone: StatusTone
  children?: ReactNode
}

export const StatusBadge = ({ tone, children }: StatusBadgeProps) => (
  <span className={[styles.status, styles[tone]].join(' ')}>
    {tone === 'current' && <span className={styles.dot} aria-hidden />}
    {children ?? LABEL[tone]}
  </span>
)
