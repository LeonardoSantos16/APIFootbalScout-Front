import { describe, expect, it } from 'vitest'
import { documentTitle } from './documentTitle'

describe('documentTitle', () => {
  it('poe o nome do app depois da pagina e do jogador', () => {
    // Act
    const title = documentTitle('Métricas por 90', 'Rafael Montes')

    // Assert
    expect(title).toBe('Métricas por 90 · Rafael Montes · APIFootballScout')
  })

  it('poe o nome do app depois de uma pagina so', () => {
    // Act
    const title = documentTitle('Shortlists')

    // Assert
    expect(title).toBe('Shortlists · APIFootballScout')
  })

  it('descarta as partes vazias ou ausentes', () => {
    // Act
    const title = documentTitle('Métricas por 90', '', undefined, '  ')

    // Assert
    expect(title).toBe('Métricas por 90 · APIFootballScout')
  })

  it('sem partes e so o nome do app', () => {
    // Act
    const title = documentTitle()

    // Assert
    expect(title).toBe('APIFootballScout')
  })
})
