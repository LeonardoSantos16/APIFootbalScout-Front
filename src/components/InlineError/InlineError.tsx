import { Button } from '../Button/Button'
import styles from './InlineError.module.css'

interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export const InlineError = ({ message, onRetry }: InlineErrorProps) => (
  <div className={styles.error} role="alert">
    <p className={styles.message}>{message}</p>
    {onRetry && <Button onClick={onRetry}>Tentar de novo</Button>}
  </div>
)
