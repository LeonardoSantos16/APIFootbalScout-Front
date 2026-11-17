import { describe, expect, it } from 'vitest'
import { formatDecimal, formatMinutes, formatPercent } from './number'

describe('formatDecimal', () => {
  it.each([
    [2.1, 2, '2,10'],
    [7.123, 2, '7,12'],
    [0, 2, '0,00'],
    [7.125, 2, '7,13'],
    [1284.5, 1, '1.284,5'],
  ])('formata %d com %d casas como %s', (value, digits, expected) => {
    // Act
    const text = formatDecimal(value, digits)

    // Assert
    expect(text).toBe(expected)
  })
})

describe('formatPercent', () => {
  it.each([
    [86.43, '86,4%'],
    [86.45, '86,5%'],
    [100, '100,0%'],
    [0, '0,0%'],
  ])('formata %d como %s', (value, expected) => {
    // Act
    const text = formatPercent(value)

    // Assert
    expect(text).toBe(expected)
  })
})

describe('formatMinutos', () => {
  it.each([
    [1284, '1.284 min'],
    [450, '450 min'],
    [312, '312 min'],
  ])('formata %d como %s', (minutes, expected) => {
    // Act
    const text = formatMinutes(minutes)

    // Assert
    expect(text).toBe(expected)
  })
})
