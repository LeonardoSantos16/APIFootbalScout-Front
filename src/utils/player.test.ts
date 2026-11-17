import { describe, expect, it } from 'vitest'
import type { PlayerDetails } from '../interfaces/player'
import { age, playerSummary, positionFromLetter } from './player'

const TODAY = new Date('2026-11-17T12:00:00Z')

const details = (data: Partial<PlayerDetails> = {}): PlayerDetails =>
  ({
    id: 1001,
    name: 'Rafael Montes',
    position: 'M',
    dateOfBirth: '1999-03-14T00:00:00Z',
    team: { id: 1960, name: 'Atlético Serrano' },
    ...data,
  }) as PlayerDetails

describe('positionFromLetter', () => {
  it.each([
    ['G', 'Goleiro'],
    ['D', 'Defesa'],
    ['M', 'Meio-campo'],
    ['F', 'Ataque'],
  ])('traduz %s para %s', (letter, expected) => {
    // Act
    const position = positionFromLetter(letter)

    // Assert
    expect(position).toBe(expected)
  })

  it.each([['X'], [''], [null], [undefined]])('nao traduz a letra %s', (letter) => {
    // Act
    const position = positionFromLetter(letter)

    // Assert
    expect(position).toBeUndefined()
  })
})

describe('age', () => {
  it('conta os anos completos', () => {
    // Act
    const years = age('1999-03-14T00:00:00Z', TODAY)

    // Assert
    expect(years).toBe(27)
  })

  it('nao conta o ano antes do aniversario', () => {
    // Act
    const years = age('1999-12-01T00:00:00Z', TODAY)

    // Assert
    expect(years).toBe(26)
  })

  it('conta o ano no dia do aniversario', () => {
    // Act
    const years = age('2000-11-17T00:00:00Z', TODAY)

    // Assert
    expect(years).toBe(26)
  })
})

describe('playerSummary', () => {
  it('junta posicao, idade e clube', () => {
    // Act
    const summary = playerSummary(details(), TODAY)

    // Assert
    expect(summary).toBe('Meio-campo, 27 anos, Atlético Serrano')
  })

  it('deixa de fora a posicao desconhecida', () => {
    // Act
    const summary = playerSummary(details({ position: 'X' }), TODAY)

    // Assert
    expect(summary).toBe('27 anos, Atlético Serrano')
  })

  it('deixa de fora o que a fonte nao mandou', () => {
    // Arrange
    const withoutClubOrBirth = details({
      team: undefined as unknown as PlayerDetails['team'],
      dateOfBirth: undefined as unknown as string,
    })

    // Act
    const summary = playerSummary(withoutClubOrBirth, TODAY)

    // Assert
    expect(summary).toBe('Meio-campo')
  })
})
