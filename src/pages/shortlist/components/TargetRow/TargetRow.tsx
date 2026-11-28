import { ArrowDownIcon, ArrowUpIcon, ArrowClockwiseIcon, DotsSixVerticalIcon, XIcon } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode, Ref } from 'react'
import { Skeleton } from '../../../../components/Skeleton/Skeleton'
import styles from './TargetRow.module.css'

interface TargetRowProps {
  priority: number
  cost: string
  fallbackName: string
  name?: string
  nameLink?: ReactNode
  detail?: string
  photo?: ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
  pending?: string
  disabled?: boolean
  dragging?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRemove?: () => void
  rowRef?: Ref<HTMLDivElement>
  style?: CSSProperties
  handleRef?: Ref<HTMLButtonElement>
  handleProps?: ButtonHTMLAttributes<HTMLButtonElement>
}

interface ActionProps {
  label: string
  name: string
  icon: ReactNode
  available: boolean
  locked: boolean
  onClick?: () => void
}

const Action = ({ label, name, icon, available, locked, onClick }: ActionProps) => (
  <button
    type="button"
    className={[styles.action, !available && styles.unavailable].filter(Boolean).join(' ')}
    disabled={locked || !available}
    aria-label={`${label} ${name}`}
    onClick={onClick}
  >
    <span className={styles.icon}>{icon}</span>
    <span className={styles.actionLabel} aria-hidden>
      {label}
    </span>
  </button>
)

const Detail = ({ pending, error, onRetry, detail }: Pick<TargetRowProps, 'pending' | 'error' | 'onRetry' | 'detail'>) => {
  if (pending) {
    return (
      <span className={styles.detail} role="status">
        {pending}
      </span>
    )
  }
  if (error) {
    return (
      <span className={styles.detail}>
        {error}
        {onRetry && (
          <button type="button" className={styles.retry} onClick={onRetry}>
            <ArrowClockwiseIcon size={16} aria-hidden />
            Tentar de novo
          </button>
        )}
      </span>
    )
  }
  return detail ? <span className={styles.detail}>{detail}</span> : null
}

export const TargetRow = ({
  priority,
  cost,
  fallbackName,
  name,
  nameLink,
  detail,
  photo,
  loading,
  error,
  onRetry,
  pending,
  disabled,
  dragging,
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
  onRemove,
  rowRef,
  style,
  handleRef,
  handleProps,
}: TargetRowProps) => {
  const accessibleName = name ?? fallbackName
  const locked = Boolean(disabled || pending)
  const className = [styles.row, pending && styles.pending, dragging && styles.dragging].filter(Boolean).join(' ')

  return (
    <div ref={rowRef} style={style} className={className} aria-busy={pending ? true : undefined}>
      <span className={styles.priority}>
        <span className={styles.hidden}>Prioridade </span>
        {priority}
      </span>
      <span className={styles.photo}>{!loading && photo ? photo : <span className={styles.photoBlank} aria-hidden />}</span>
      {loading ? (
        <span className={styles.main} aria-hidden>
          <Skeleton className={styles.skeletonName} />
          <Skeleton className={styles.skeletonDetail} />
        </span>
      ) : (
        <span className={styles.main}>
          {name && nameLink ? (
            <span className={styles.name}>{nameLink}</span>
          ) : (
            <span className={[styles.name, !name && styles.fallback].filter(Boolean).join(' ')}>{accessibleName}</span>
          )}
          <Detail pending={pending} error={error} onRetry={onRetry} detail={detail} />
        </span>
      )}
      <span className={styles.cost}>
        <span className={styles.costValue}>{cost}</span>
        <span className={styles.costLabel}>Custo estimado</span>
      </span>
      <span className={styles.actions}>
        <button
          ref={handleRef}
          type="button"
          className={[styles.action, styles.handle].join(' ')}
          disabled={locked}
          aria-label={`Arrastar ${accessibleName}`}
          {...handleProps}
        >
          <span className={styles.icon}>
            <DotsSixVerticalIcon size={20} aria-hidden />
          </span>
        </button>
        <Action
          label="Subir"
          name={accessibleName}
          icon={<ArrowUpIcon size={20} aria-hidden />}
          available={canMoveUp}
          locked={locked}
          onClick={onMoveUp}
        />
        <Action
          label="Descer"
          name={accessibleName}
          icon={<ArrowDownIcon size={20} aria-hidden />}
          available={canMoveDown}
          locked={locked}
          onClick={onMoveDown}
        />
        <Action
          label="Remover"
          name={accessibleName}
          icon={<XIcon size={20} aria-hidden />}
          available
          locked={locked}
          onClick={onRemove}
        />
      </span>
    </div>
  )
}
