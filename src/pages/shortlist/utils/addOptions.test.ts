import { describe, expect, it } from 'vitest'
import { anaShortlists, atacantesShortlist, lateraisShortlist } from '../../../mocks/fixtures/shortlists'
import { addedMessage, defaultPriority, defaultShortlist, priorityOptions, shortlistOptions } from './addOptions'

describe('shortlistOptions', () => {
  it('mostra o motivo de cada shortlist que nao aceita o jogador', () => {
    // Act
    const options = shortlistOptions(anaShortlists(), 1001)

    // Assert
    expect(options.map(({ label, disabled }) => ({ label, disabled }))).toEqual([
      { label: 'Atacantes — Cheia (25 de 25)', disabled: true },
      { label: 'Conflito — 2 de 25 alvos', disabled: false },
      { label: 'Laterais 2027 — Já está nesta shortlist', disabled: true },
      { label: 'Meias para janeiro — 0 de 25 alvos', disabled: false },
    ])
  })

  it('escolhe a primeira shortlist que aceita o jogador', () => {
    // Act
    const chosen = defaultShortlist(shortlistOptions(anaShortlists(), 1001))

    // Assert
    expect(chosen).toBe(anaShortlists()[1].shortlistId)
  })

  it('nao escolhe nenhuma quando todas recusam o jogador', () => {
    // Act
    const chosen = defaultShortlist(shortlistOptions([atacantesShortlist(), lateraisShortlist()], 1001))

    // Assert
    expect(chosen).toBeUndefined()
  })
})

describe('priorityOptions', () => {
  it('vai do topo ao fim da lista mais um', () => {
    // Act
    const options = priorityOptions(2)

    // Assert
    expect(options).toEqual([
      { value: '1', label: '1 — no topo' },
      { value: '2', label: '2' },
      { value: '3', label: '3 — no fim' },
    ])
    expect(defaultPriority(2)).toBe('3')
  })

  it('oferece so o topo numa shortlist vazia', () => {
    // Act
    const options = priorityOptions(0)

    // Assert
    expect(options).toEqual([{ value: '1', label: '1 — no topo' }])
    expect(defaultPriority(0)).toBe('1')
  })
})

describe('addedMessage', () => {
  it('diz onde o alvo entrou', () => {
    // Act
    const message = addedMessage('Conflito', 3)

    // Assert
    expect(message).toBe('Adicionado a Conflito, na prioridade 3.')
  })
})
