import { PlusIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import { Button } from '../../../../components/Button/Button'
import styles from './PointList.module.css'

interface PointListProps {
  label: string
  items: string[]
  onChange?: (items: string[]) => void
  count?: string
  placeholder?: string
  readOnly?: boolean
  emptyText?: string
  disabled?: boolean
}

const ADD_LABEL = 'Adicionar ponto'
const REMOVE_LABEL = 'Remover'
const EMPTY_TEXT = 'Nenhum ponto.'

export const PointList = ({
  label,
  items,
  onChange,
  count,
  placeholder,
  readOnly,
  emptyText = EMPTY_TEXT,
  disabled,
}: PointListProps) => {
  const labelId = useId()

  const head = (
    <div className={styles.head}>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      {count && <span className={styles.count}>{count}</span>}
    </div>
  )

  if (readOnly) {
    return (
      <div className={styles.points}>
        {head}
        {items.length > 0 ? (
          <ul className={styles.read} aria-labelledby={labelId}>
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{emptyText}</p>
        )}
      </div>
    )
  }

  const change = (index: number, value: string) => onChange?.(items.map((item, i) => (i === index ? value : item)))
  const remove = (index: number) => onChange?.(items.filter((_, i) => i !== index))

  return (
    <div className={styles.points} role="group" aria-labelledby={labelId}>
      {head}
      {items.length > 0 && (
        <ol className={styles.list}>
          {items.map((item, index) => (
            <li key={index} className={[styles.wrap, disabled && styles.disabled].filter(Boolean).join(' ')}>
              <input
                type="text"
                className={styles.input}
                value={item}
                placeholder={placeholder}
                disabled={disabled}
                aria-label={`${label}, ponto ${index + 1}`}
                onChange={(event) => change(index, event.target.value)}
              />
              <button
                type="button"
                className={styles.remove}
                disabled={disabled}
                aria-label={`Remover ponto ${index + 1}`}
                onClick={() => remove(index)}
              >
                {REMOVE_LABEL}
              </button>
            </li>
          ))}
        </ol>
      )}
      <div>
        <Button variant="ghost" className={styles.add} disabled={disabled} onClick={() => onChange?.([...items, ''])}>
          <PlusIcon size={20} aria-hidden />
          {ADD_LABEL}
        </Button>
      </div>
    </div>
  )
}
