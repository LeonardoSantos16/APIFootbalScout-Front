import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import { PlayerPhoto } from '../../../../components/PlayerPhoto/PlayerPhoto'
import type { TargetResponse, TargetWrite } from '../../interfaces/shortlist'
import { formatCost } from '../../utils/cost'
import { canMoveDown, canMoveUp, pendingText } from '../../utils/reorder'
import { targetProfileView, type ProfileState } from '../../utils/targetRow'
import { TargetRow } from '../TargetRow/TargetRow'
import styles from './TargetList.module.css'

const MOVE_DURATION_MS = 150

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export interface TargetProfile extends ProfileState {
  refetch: () => unknown
}

interface SortableTargetProps {
  target: TargetResponse
  profile?: TargetProfile
  count: number
  pending?: TargetWrite
  locked: boolean
  onWrite: (write: TargetWrite) => void
  renderPlayerLink: (playerId: number, name: string) => ReactNode
}

export const SortableTarget = ({
  target,
  profile,
  count,
  pending,
  locked,
  onWrite,
  renderPlayerLink,
}: SortableTargetProps) => {
  const animate = !prefersReducedMotion()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: target.jogadorId,
    disabled: locked,
    animateLayoutChanges: () => animate,
    transition: animate ? { duration: MOVE_DURATION_MS, easing: 'ease' } : null,
  })
  const view = targetProfileView(target.jogadorId, profile)
  const playerId = target.jogadorId
  const priority = target.prioridade

  return (
    <li className={styles.item}>
      <TargetRow
        rowRef={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        handleRef={setActivatorNodeRef}
        handleProps={{ ...attributes, ...listeners }}
        priority={priority}
        cost={formatCost(target.custoEstimado)}
        fallbackName={view.fallbackName}
        name={view.name}
        nameLink={view.name ? renderPlayerLink(playerId, view.name) : undefined}
        detail={view.detail}
        photo={view.name ? <PlayerPhoto name={view.name} src={view.photo} size="small" /> : undefined}
        loading={view.loading}
        error={view.error}
        onRetry={view.canRetry ? () => void profile?.refetch() : undefined}
        pending={pending?.playerId === playerId ? pendingText(pending) : undefined}
        disabled={locked}
        dragging={isDragging}
        canMoveUp={canMoveUp(priority)}
        canMoveDown={canMoveDown(priority, count)}
        onMoveUp={() => onWrite({ kind: 'move', playerId, priority: priority - 1 })}
        onMoveDown={() => onWrite({ kind: 'move', playerId, priority: priority + 1 })}
        onRemove={() => onWrite({ kind: 'remove', playerId })}
      />
    </li>
  )
}
