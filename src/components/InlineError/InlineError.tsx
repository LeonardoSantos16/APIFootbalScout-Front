import { Button } from '../Button/Button'
import styles from './InlineError.module.css'

const RETRY_LABEL = 'Tentar de novo'

interface InlineErrorProps {
  message: string
  onRetry?: () => void
  actionLabel?: string
}

export const InlineError = ({ message, onRetry, actionLabel = RETRY_LABEL }: InlineErrorProps) => (
  <div className={styles.error} role="alert">
    <p className={styles.message}>{message}</p>
    {onRetry && <Button onClick={onRetry}>{actionLabel}</Button>}
  </div>
)
