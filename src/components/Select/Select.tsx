import { CaretDownIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import { Skeleton } from '../Skeleton/Skeleton'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  label: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  loading?: boolean
  disabled?: boolean
}

export const Select = ({ label, options, value, onChange, loading, disabled }: SelectProps) => {
  const id = useId()

  return (
    <div className={styles.field} aria-busy={loading || undefined}>
      <label className={styles.label} htmlFor={loading ? undefined : id}>
        {label}
      </label>
      {loading ? (
        <Skeleton className={styles.skeleton} />
      ) : (
        <div className={styles.wrap}>
          <select
            id={id}
            className={styles.select}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <CaretDownIcon className={styles.caret} size={20} aria-hidden />
        </div>
      )}
    </div>
  )
}
