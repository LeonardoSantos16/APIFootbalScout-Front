import { describe, expect, it } from 'vitest'
import type { components } from '../../../api/schema'
import { playerResults, resultSummary } from './results'

type Schemas = components['schemas']

const entity = (data: Partial<Schemas['SofaEntity']> = {}): Schemas['SofaEntity'] => ({
  id: 1001,
  name: 'Rafael Silva',
  shortName: 'R. Silva',
  team: { id: 1960, name: 'Atlético Serrano', gender: 'M' },
  country: { name: 'Brasil', alpha2: 'BR' },
  position: 'M',
  jerseyNumber: '8',
  sofascoreId: null,
  ...data,
})

const result = (type: string, data: Partial<Schemas['SofaEntity']> = {}): Schemas['SofaSearchResult'] => ({
  entity: entity(data),
  score: 100,
  type,
})

describe('playerResults', () => {
  it('mantem so os jogadores, na ordem da fonte', () => {
    // Arrange
    const response: Schemas['SofaSearchResponse'] = {
      results: [
        result('player', { id: 2, name: 'Thiago Silva' }),
        result('team', { id: 5981, name: 'Flamengo' }),
        result('player', { id: 1, name: 'Rafael Silva' }),
      ],
    }

    // Act
    const players = playerResults(response)

    // Assert
    expect(players.map((player) => player.id)).toEqual([2, 1])
  })

  it('devolve lista vazia sem resultados', () => {
    // Arrange
    const response: Schemas['SofaSearchResponse'] = { results: [] }

    // Act
    const players = playerResults(response)

    // Assert
    expect(players).toEqual([])
  })
})

describe('resultSummary', () => {
  it('junta posicao, clube e pais', () => {
    // Arrange
    const player = entity()

    // Act
    const summary = resultSummary(player)

    // Assert
    expect(summary).toBe('Meio-campo, Atlético Serrano, Brasil')
  })

  it('deixa de fora o clube ausente', () => {
    // Arrange
    const player = entity({ position: 'F', team: null })

    // Act
    const summary = resultSummary(player)

    // Assert
    expect(summary).toBe('Ataque, Brasil')
  })

  it('fica vazio quando so ha o nome', () => {
    // Arrange
    const player = entity({ position: null, team: null, country: null })

    // Act
    const summary = resultSummary(player)

    // Assert
    expect(summary).toBe('')
  })

  it('deixa de fora a letra de posicao desconhecida', () => {
    // Arrange
    const player = entity({ position: 'X' })

    // Act
    const summary = resultSummary(player)

    // Assert
    expect(summary).toBe('Atlético Serrano, Brasil')
  })
})
