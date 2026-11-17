import styles from './Tabs.module.css'

export interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  value: string
  ariaLabel: string
  onChange?: (id: string) => void
}

export const Tabs = ({ items, value, ariaLabel, onChange }: TabsProps) => (
  <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
    {items.map((item) => {
      const selected = item.id === value
      return (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={selected}
          className={[styles.tab, selected && styles.selected].filter(Boolean).join(' ')}
          onClick={() => onChange?.(item.id)}
        >
          {item.label}
        </button>
      )
    })}
  </div>
)
