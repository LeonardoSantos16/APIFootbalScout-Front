import { CaretDownIcon } from '@phosphor-icons/react'
import { useId } from 'react'
import styles from './MoneyField.module.css'

interface MoneyFieldProps {
  label?: string
  value: string
  onChange?: (value: string) => void
  currency: string
  currencies: string[]
  onCurrencyChange?: (currency: string) => void
  lockedCurrency?: boolean
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
}

export const MoneyField = ({
  label = 'Custo estimado',
  value,
  onChange,
  currency,
  currencies,
  onCurrencyChange,
  lockedCurrency,
  placeholder,
  hint,
  error,
  disabled,
}: MoneyFieldProps) => {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.row}>
        <div className={[styles.wrap, error && styles.invalid, disabled && styles.disabled].filter(Boolean).join(' ')}>
          <input
            id={id}
            type="text"
            inputMode="decimal"
            className={styles.input}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange?.(event.target.value)}
          />
          <span className={styles.suffix} aria-hidden>
            M
          </span>
        </div>
        {lockedCurrency ? (
          <span className={styles.locked} aria-label={`Moeda ${currency}, definida pela lista`}>
            {currency}
          </span>
        ) : (
          <div className={styles.currency}>
            <select
              className={styles.select}
              aria-label="Moeda"
              value={currency}
              disabled={disabled}
              onChange={(event) => onCurrencyChange?.(event.target.value)}
            >
              {currencies.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <CaretDownIcon className={styles.caret} size={20} aria-hidden />
          </div>
        )}
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
