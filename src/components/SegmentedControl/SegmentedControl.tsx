import { useId } from 'react'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: SegmentedOption<T>[]
  value: T | null
  onChange?: (value: T) => void
  disabled?: boolean
}

export const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SegmentedControlProps<T>) => {
  const name = useId()

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.segments}>
        {options.map((option) => {
          const checked = option.value === value
          return (
            <label key={option.value} className={[styles.segment, checked && styles.selected].filter(Boolean).join(' ')}>
              <input
                type="radio"
                className={styles.radio}
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange?.(option.value)}
              />
              {checked && <span className={styles.dot} aria-hidden />}
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
