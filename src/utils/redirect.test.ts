import { describe, expect, it } from 'vitest'
import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  it.each([
    ['/jogadores/1001/metricas?competicao=325&temporada=58766&contexto=Clube'],
    ['/conta'],
    ['/'],
  ])('segue o caminho interno %s', (path) => {
    // Act
    const destination = safeRedirect(path)

    // Assert
    expect(destination).toBe(path)
  })

  it.each([
    ['caminho com duas barras', '//exemplo.com'],
    ['URL absoluta', 'https://exemplo.com/conta'],
    ['barra invertida', '/\\exemplo.com'],
    ['texto vazio', ''],
    ['sem destino', undefined],
    ['valor que nao e texto', 42],
  ])('ignora %s e vai para o inicio', (_case, value) => {
    // Act
    const destination = safeRedirect(value)

    // Assert
    expect(destination).toBe('/')
  })
})
