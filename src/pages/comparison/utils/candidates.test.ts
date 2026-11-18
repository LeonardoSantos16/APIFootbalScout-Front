import { describe, expect, it } from 'vitest'
import type { SearchPlayer } from '../../../utils/searchResults'
import { comparableResults, filterNote, noComparableText } from './candidates'

const player = (id: number, position: string | null): SearchPlayer => ({
  id,
  name: `Jogador ${id}`,
  shortName: `J. ${id}`,
  team: null,
  country: null,
  position,
  jerseyNumber: null,
  sofascoreId: null,
})

describe('comparableResults', () => {
  it('mantem so as posicoes compativeis com o meio-campo, na ordem da fonte', () => {
    // Arrange
    const players = [player(1, 'F'), player(2, 'G'), player(3, 'M'), player(4, null), player(5, 'D')]

    // Act
    const results = comparableResults(players, 1001, 'M')

    // Assert
    expect(results.map((item) => item.id)).toEqual([1, 3, 5])
  })

  it('mantem so goleiros para um goleiro', () => {
    // Arrange
    const players = [player(1, 'G'), player(2, 'D')]

    // Act
    const results = comparableResults(players, 1001, 'G')

    // Assert
    expect(results.map((item) => item.id)).toEqual([1])
  })

  it('tira o jogador da pagina', () => {
    // Arrange
    const players = [player(1001, 'M'), player(2, 'M')]

    // Act
    const results = comparableResults(players, 1001, 'M')

    // Assert
    expect(results.map((item) => item.id)).toEqual([2])
  })

  it('tira quem tem letra desconhecida', () => {
    // Arrange
    const players = [player(1, 'X'), player(2, 'M')]

    // Act
    const results = comparableResults(players, 1001, 'M')

    // Assert
    expect(results.map((item) => item.id)).toEqual([2])
  })
})

describe('textos da busca do segundo jogador', () => {
  it('explica o filtro pela posicao do jogador da pagina', () => {
    // Act
    const note = filterNote('M')

    // Assert
    expect(note).toBe('Mostrando só jogadores comparáveis com meio-campo.')
  })

  it('diz que nao achou jogador comparavel com o termo', () => {
    // Act
    const text = noComparableText('M', 'pedro')

    // Assert
    expect(text).toBe('Nenhum jogador comparável com meio-campo para "pedro".')
  })

  it('usa a posicao do goleiro em minusculas', () => {
    // Act
    const note = filterNote('G')

    // Assert
    expect(note).toBe('Mostrando só jogadores comparáveis com goleiro.')
  })
})
