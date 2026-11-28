import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ReactNode } from 'react'
import type { TargetResponse, TargetWrite } from '../../interfaces/shortlist'
import { DRAG_INSTRUCTIONS, dragAnnouncements, dropPriority } from '../../utils/reorder'
import { fallbackName } from '../../utils/targetRow'
import { SortableTarget, type TargetProfile } from './SortableTarget'
import styles from './TargetList.module.css'

const POINTER_DISTANCE = 6
const LIST_LABEL = 'Alvos em ordem de prioridade'

export interface TargetListProps {
  targets: TargetResponse[]
  profiles: TargetProfile[]
  pending?: TargetWrite
  locked: boolean
  onWrite: (write: TargetWrite) => void
  renderPlayerLink: (playerId: number, name: string) => ReactNode
}

export const TargetList = ({ targets, profiles, pending, locked, onWrite, renderPlayerLink }: TargetListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: POINTER_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const nameOf = (playerId: number) =>
    profiles[targets.findIndex((target) => target.jogadorId === playerId)]?.data?.details?.name ??
    fallbackName(playerId)

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const priority = dropPriority(targets, Number(active.id), over ? Number(over.id) : undefined)
    if (priority !== undefined) onWrite({ kind: 'move', playerId: Number(active.id), priority })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: dragAnnouncements(targets, nameOf),
        screenReaderInstructions: { draggable: DRAG_INSTRUCTIONS },
      }}
    >
      <SortableContext items={targets.map((target) => target.jogadorId)} strategy={verticalListSortingStrategy}>
        <ol className={styles.list} aria-label={LIST_LABEL}>
          {targets.map((target, index) => (
            <SortableTarget
              key={target.jogadorId}
              target={target}
              profile={profiles[index]}
              count={targets.length}
              pending={pending}
              locked={locked}
              onWrite={onWrite}
              renderPlayerLink={renderPlayerLink}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}
