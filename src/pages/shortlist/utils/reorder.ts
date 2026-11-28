import type { Announcements, UniqueIdentifier } from '@dnd-kit/core'
import type { TargetResponse, TargetWrite } from '../interfaces/shortlist'

export const CANCELLED_TEXT = 'cancelado'
export const REMOVING_TEXT = 'Removendo…'

export const DRAG_INSTRUCTIONS =
  'Para reordenar, pressione espaço, use as setas e pressione espaço de novo. Esc cancela.'

export const canMoveUp = (priority: number): boolean => priority > 1

export const canMoveDown = (priority: number, count: number): boolean => priority < count

export const dropPriority = (
  targets: TargetResponse[],
  activeId: number,
  overId: number | undefined,
): number | undefined => {
  if (overId === undefined || overId === activeId) return undefined
  if (!targets.some((target) => target.jogadorId === activeId)) return undefined
  return targets.find((target) => target.jogadorId === overId)?.prioridade
}

export const pendingText = (write: TargetWrite): string =>
  write.kind === 'move' ? `Movendo para a prioridade ${write.priority}…` : REMOVING_TEXT

export const pickedText = (name: string, priority: number, count: number): string =>
  `${name} pego, prioridade ${priority} de ${count}`

export const movedText = (priority: number): string => `movido para a prioridade ${priority}`

export const droppedText = (priority: number): string => `solto na prioridade ${priority}`

export const dragAnnouncements = (targets: TargetResponse[], nameOf: (playerId: number) => string): Announcements => {
  const priorityOf = (id: UniqueIdentifier) =>
    targets.find((target) => target.jogadorId === Number(id))?.prioridade ?? 0
  return {
    onDragStart: ({ active }) => pickedText(nameOf(Number(active.id)), priorityOf(active.id), targets.length),
    onDragOver: ({ active, over }) => (over && over.id !== active.id ? movedText(priorityOf(over.id)) : undefined),
    onDragEnd: ({ over }) => (over ? droppedText(priorityOf(over.id)) : CANCELLED_TEXT),
    onDragCancel: () => CANCELLED_TEXT,
  }
}
