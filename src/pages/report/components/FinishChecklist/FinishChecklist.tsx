import { CheckIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import type { ChecklistItem } from '../../interfaces/report'
import styles from './FinishChecklist.module.css'

interface FinishChecklistProps {
  items: ChecklistItem[]
  title?: string
}

const TITLE = 'Para finalizar'

export const FinishChecklist = ({ items, title = TITLE }: FinishChecklistProps) => {
  const titleId = useId()

  return (
    <div className={styles.checklist}>
      <p className={styles.title} id={titleId}>
        {title}
      </p>
      <ul className={styles.list} aria-labelledby={titleId}>
        {items.map((item) => (
          <li key={item.label} className={[styles.item, item.done && styles.done].filter(Boolean).join(' ')}>
            {item.done ? (
              <CheckIcon className={styles.mark} size={20} aria-hidden />
            ) : (
              <span className={styles.ring} aria-hidden />
            )}
            <span>
              {item.label}
              {item.progress && <span className={styles.progress}> ({item.progress})</span>}
              <span className={styles.hidden}>{item.done ? ', cumprido' : ', pendente'}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
