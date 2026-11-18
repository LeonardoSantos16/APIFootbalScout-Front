import { describe, expect, it } from 'vitest'
import { SHORT_TERM_MESSAGE, isSearchableTerm, normalizeTerm, validateTerm } from './search'

describe('normalizeTerm', () => {
  it('tira os espacos das pontas', () => {
    // Arrange
    const raw = '  silva '

    // Act
    const term = normalizeTerm(raw)

    // Assert
    expect(term).toBe('silva')
  })

  it('trata termo so de espacos como ausente', () => {
    // Arrange
    const raw = '   '

    // Act
    const term = normalizeTerm(raw)

    // Assert
    expect(term).toBeUndefined()
  })

  it('trata valor que nao e texto como ausente', () => {
    // Arrange
    const raw = 42

    // Act
    const term = normalizeTerm(raw)

    // Assert
    expect(term).toBeUndefined()
  })
})

describe('validateTerm', () => {
  it('pede pelo menos 2 letras', () => {
    // Arrange
    const raw = ' s '

    // Act
    const message = validateTerm(raw)

    // Assert
    expect(message).toBe('Digite pelo menos 2 letras do nome.')
    expect(SHORT_TERM_MESSAGE).toBe('Digite pelo menos 2 letras do nome.')
  })

  it('aceita 2 letras ou mais', () => {
    // Arrange
    const raw = 'si'

    // Act
    const message = validateTerm(raw)

    // Assert
    expect(message).toBeUndefined()
  })
})

describe('isSearchableTerm', () => {
  it('so busca com 2 letras ou mais', () => {
    // Arrange
    const terms = [undefined, 's', 'si']

    // Act
    const result = terms.map(isSearchableTerm)

    // Assert
    expect(result).toEqual([false, false, true])
  })
})
