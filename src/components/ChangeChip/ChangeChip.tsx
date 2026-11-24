import type { ReactNode } from 'react'
import styles from './ChangeChip.module.css'

export type ChangeDirection = 'up' | 'down'

interface ChangeChipProps {
  direction: ChangeDirection
  children: ReactNode
}

export const ChangeChip = ({ direction, children }: ChangeChipProps) => (
  <span className={[styles.chip, styles[direction]].join(' ')}>{children}</span>
)
