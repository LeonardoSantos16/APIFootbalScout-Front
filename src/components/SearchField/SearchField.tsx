import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useId, type FormEvent } from 'react'
import styles from './SearchField.module.css'

export type SearchFieldSize = 'default' | 'compact'

interface SearchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  error?: string
  size?: SearchFieldSize
  submitLabel?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export const SearchField = ({
  label,
  value,
  onChange,
  onSubmit,
  placeholder,
  error,
  size = 'default',
  submitLabel = 'Buscar',
  disabled,
  autoFocus,
  className,
}: SearchFieldProps) => {
  const id = useId()
  const errorId = `${id}-error`
  const compact = size === 'compact'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(value)
  }

  return (
    <form
      role="search"
      noValidate
      className={[styles.search, compact && styles.compact, className].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
    >
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={[styles.wrap, error && styles.invalid].filter(Boolean).join(' ')}>
        <MagnifyingGlassIcon size={20} className={styles.icon} aria-hidden />
        <input
          id={id}
          type="search"
          className={styles.input}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {!compact && (
          <button type="submit" className={styles.submit} disabled={disabled}>
            {submitLabel}
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </form>
  )
}
