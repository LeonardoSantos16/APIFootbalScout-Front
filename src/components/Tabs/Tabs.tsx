import { Fragment, type ReactNode } from 'react'
import styles from './Tabs.module.css'

export interface TabItem {
  id: string
  label: string
}

export interface TabLinkProps {
  className: string
  'aria-current'?: 'page'
  children: ReactNode
}

interface TabsProps {
  items: TabItem[]
  value: string
  ariaLabel: string
  onChange?: (id: string) => void
  renderLink?: (item: TabItem, props: TabLinkProps) => ReactNode
  disabled?: boolean
}

const classNames = (selected: boolean, disabled?: boolean) =>
  [styles.tab, selected && styles.selected, disabled && styles.disabled].filter(Boolean).join(' ')

export const Tabs = ({ items, value, ariaLabel, onChange, renderLink, disabled }: TabsProps) => {
  if (renderLink) {
    return (
      <nav className={styles.tabs} aria-label={ariaLabel}>
        {items.map((item) => {
          const selected = item.id === value
          if (disabled) {
            return (
              <span key={item.id} className={classNames(false, true)} aria-disabled="true">
                {item.label}
              </span>
            )
          }
          return (
            <Fragment key={item.id}>
              {renderLink(item, {
                className: classNames(selected),
                'aria-current': selected ? 'page' : undefined,
                children: item.label,
              })}
            </Fragment>
          )
        })}
      </nav>
    )
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            className={classNames(selected, disabled)}
            onClick={() => onChange?.(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
