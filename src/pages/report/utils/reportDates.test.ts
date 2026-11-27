import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatDate, observationToApi, toInputDate, todayInput } from './reportDates'

afterEach(() => {
  vi.useRealTimers()
})

describe('todayInput', () => {
  it('usa o dia local, mesmo perto da meia-noite', () => {
    // Arrange
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 23, 30))

    // Act
    const today = todayInput()

    // Assert
    expect(today).toBe('2026-11-24')
  })
})

describe('toInputDate', () => {
  it('le a data no dia local', () => {
    // Act
    const date = toInputDate(new Date(2026, 10, 2, 0, 0).toISOString())

    // Assert
    expect(date).toBe('2026-11-02')
  })
})

describe('observationToApi', () => {
  it('manda a meia-noite local com o fuso', () => {
    // Act
    const iso = observationToApi('2026-11-24')

    // Assert
    expect(iso).toMatch(/^2026-11-24T00:00:00[+-]\d{2}:\d{2}$/)
    expect(new Date(iso).getTime()).toBe(new Date(2026, 10, 24).getTime())
  })
})

describe('formatDate', () => {
  it('mostra a data no padrao brasileiro, no dia local', () => {
    // Act
    const text = formatDate(new Date(2026, 10, 24, 0, 0).toISOString())

    // Assert
    expect(text).toBe('24/11/2026')
  })
})
