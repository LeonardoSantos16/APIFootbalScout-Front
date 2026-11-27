import { useId, type TextareaHTMLAttributes } from 'react'
import styles from './TextArea.module.css'

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  hint?: string
  error?: string
}

const DEFAULT_ROWS = 6

export const TextArea = ({ label, hint, error, className, disabled, rows = DEFAULT_ROWS, ...rest }: TextAreaProps) => {
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
        <textarea
          id={id}
          rows={rows}
          className={styles.textarea}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
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
