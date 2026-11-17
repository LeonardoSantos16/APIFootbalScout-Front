import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './TextField.module.css'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  error?: string
  trailing?: ReactNode
}

export const TextField = ({ label, hint, error, trailing, className, type = 'text', disabled, ...rest }: TextFieldProps) => {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={[styles.wrap, error && styles.invalid, disabled && styles.disabled].filter(Boolean).join(' ')}>
        <input
          id={id}
          type={type}
          className={styles.input}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : (
        hint && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}
