import { describe, expect, it } from 'vitest'
import { lateraisShortlist } from '../../../mocks/fixtures/shortlists'
import {
  CANCELLED_TEXT,
  canMoveDown,
  canMoveUp,
  dragAnnouncements,
  droppedText,
  dropPriority,
  movedText,
  pendingText,
  pickedText,
} from './reorder'

const MIGUEL = 1007
const DIEGO = 1006

describe('canMoveUp e canMoveDown', () => {
  it('travam nas pontas da lista', () => {
    // Assert
    expect(canMoveUp(1)).toBe(false)
    expect(canMoveUp(2)).toBe(true)
    expect(canMoveDown(4, 4)).toBe(false)
    expect(canMoveDown(3, 4)).toBe(true)
  })
})

describe('dropPriority', () => {
  it('usa a prioridade do alvo sobre o qual o arrastado foi solto', () => {
    // Act
    const priority = dropPriority(lateraisShortlist().alvos, DIEGO, MIGUEL)

    // Assert
    expect(priority).toBe(1)
  })

  it('nao pede nada quando o alvo volta ao proprio lugar', () => {
    // Act
    const same = dropPriority(lateraisShortlist().alvos, DIEGO, DIEGO)
    const outside = dropPriority(lateraisShortlist().alvos, DIEGO, undefined)

    // Assert
    expect(same).toBeUndefined()
    expect(outside).toBeUndefined()
  })
})

describe('pendingText', () => {
  it('diz para onde o alvo vai ou que ele esta saindo', () => {
    // Assert
    expect(pendingText({ kind: 'move', playerId: DIEGO, priority: 1 })).toBe('Movendo para a prioridade 1…')
    expect(pendingText({ kind: 'remove', playerId: MIGUEL })).toBe('Removendo…')
  })
})

describe('anuncios do arrasto', () => {
  it('narram o arrasto em portugues', () => {
    // Assert
    expect(pickedText('Diego Albuquerque', 3, 4)).toBe('Diego Albuquerque pego, prioridade 3 de 4')
    expect(movedText(1)).toBe('movido para a prioridade 1')
    expect(droppedText(1)).toBe('solto na prioridade 1')
    expect(CANCELLED_TEXT).toBe('cancelado')
  })
})

describe('dragAnnouncements', () => {
  const announcements = dragAnnouncements(lateraisShortlist().alvos, (id) =>
    id === DIEGO ? 'Diego Albuquerque' : 'Miguel Torres',
  )
  type DragEvent = Parameters<typeof announcements.onDragEnd>[0]
  const event = (activeId: number, overId?: number) =>
    ({ active: { id: activeId }, over: overId === undefined ? null : { id: overId } }) as unknown as DragEvent

  it('narra o alvo pego, o movimento e a soltura', () => {
    // Assert
    expect(announcements.onDragStart(event(DIEGO))).toBe('Diego Albuquerque pego, prioridade 3 de 4')
    expect(announcements.onDragOver(event(DIEGO, MIGUEL))).toBe('movido para a prioridade 1')
    expect(announcements.onDragEnd(event(DIEGO, MIGUEL))).toBe('solto na prioridade 1')
  })

  it('nao anuncia movimento sobre o proprio lugar e anuncia o cancelamento', () => {
    // Assert
    expect(announcements.onDragOver(event(DIEGO, DIEGO))).toBeUndefined()
    expect(announcements.onDragEnd(event(DIEGO))).toBe('cancelado')
    expect(announcements.onDragCancel(event(DIEGO))).toBe('cancelado')
  })
})
