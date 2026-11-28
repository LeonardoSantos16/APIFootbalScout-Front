import { describe, expect, it } from 'vitest'
import { SHORTLIST_IDS } from '../mocks/fixtures/shortlists'
import { isUuid, parsePlayerId } from './routeParams'

describe('parsePlayerId', () => {
  it('le um numero inteiro a partir de 1', () => {
    // Act
    const id = parsePlayerId('1001')

    // Assert
    expect(id).toBe(1001)
  })

  it.each(['abc', '0', '-3', '01', '1.5', '', '12a'])('recusa "%s"', (raw) => {
    // Act
    const id = parsePlayerId(raw)

    // Assert
    expect(id).toBeNull()
  })
})

describe('isUuid', () => {
  it('aceita o id de uma shortlist', () => {
    // Act
    const valid = isUuid(SHORTLIST_IDS.laterais)

    // Assert
    expect(valid).toBe(true)
  })

  it.each(['123', 'abc', '', `${SHORTLIST_IDS.laterais}0`])('recusa "%s"', (raw) => {
    // Act
    const valid = isUuid(raw)

    // Assert
    expect(valid).toBe(false)
  })
})
