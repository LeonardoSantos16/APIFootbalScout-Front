import { describe, expect, it } from 'vitest'
import type { PlayerDetails } from '../../../interfaces/player'
import { marketValue } from './marketValue'

const details = (raw: PlayerDetails['proposedMarketValueRaw']): PlayerDetails =>
  ({ id: 1001, name: 'Rafael Silva', proposedMarketValueRaw: raw }) as PlayerDetails

describe('marketValue', () => {
  it('formata o valor com a moeda', () => {
    // Arrange
    const player = details({ value: 12_500_000, currency: 'EUR' })

    // Act
    const value = marketValue(player)

    // Assert
    expect(value).toBe('€12,5M')
  })

  it('nao mostra nada sem valor', () => {
    // Arrange
    const player = details(null)

    // Act
    const value = marketValue(player)

    // Assert
    expect(value).toBeUndefined()
  })

  it('nao mostra nada com valor zero', () => {
    // Arrange
    const player = details({ value: 0, currency: 'EUR' })

    // Act
    const value = marketValue(player)

    // Assert
    expect(value).toBeUndefined()
  })
})
