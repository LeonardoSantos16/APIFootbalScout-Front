import { useId } from 'react'
import { TextField } from '../TextField/TextField'
import styles from './DateField.module.css'

interface DateFieldProps {
  label: string
  value: string
  max?: string
  onChange?: (value: string) => void
  readOnly?: boolean
  hint?: string
  error?: string
  disabled?: boolean
}

const formatInputDate = (value: string) => {
  const [year, month, day] = value.split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

export const DateField = ({ label, value, max, onChange, readOnly, hint, error, disabled }: DateFieldProps) => {
  const id = useId()

  if (readOnly) {
    return (
      <div className={styles.field}>
        <span className={styles.label} id={id}>
          {label}
        </span>
        <span className={styles.value} aria-labelledby={id}>
          {formatInputDate(value)}
        </span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
    )
  }

  return (
    <TextField
      className={styles.input}
      label={label}
      type="date"
      value={value}
      max={max}
      hint={hint}
      error={error}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
    />
  )
}
