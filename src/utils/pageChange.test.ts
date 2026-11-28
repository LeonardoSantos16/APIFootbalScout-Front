import { describe, expect, it } from 'vitest'
import { scrollKey, shouldMoveFocus } from './pageChange'

describe('shouldMoveFocus', () => {
  it('nao move o foco no primeiro carregamento', () => {
    // Act
    const move = shouldMoveFocus(undefined, '/')

    // Assert
    expect(move).toBe(false)
  })

  it('nao move o foco quando so os search params mudam', () => {
    // Act
    const move = shouldMoveFocus('/busca?termo=a', '/busca?termo=b')

    // Assert
    expect(move).toBe(false)
  })

  it('nao move o foco entre as abas do mesmo jogador', () => {
    // Act
    const move = shouldMoveFocus('/jogadores/1001', '/jogadores/1001/metricas?competicao=1')

    // Assert
    expect(move).toBe(false)
  })

  it('move o foco para outro jogador', () => {
    // Act
    const move = shouldMoveFocus('/jogadores/1001/metricas', '/jogadores/1002')

    // Assert
    expect(move).toBe(true)
  })

  it('move o foco da busca para um perfil', () => {
    // Act
    const move = shouldMoveFocus('/busca?termo=silva', '/jogadores/1001')

    // Assert
    expect(move).toBe(true)
  })

  it('move o foco do relatorio para a lista de relatorios do jogador', () => {
    // Act
    const move = shouldMoveFocus('/jogadores/1001/relatorios/novo', '/jogadores/1001/relatorios')

    // Assert
    expect(move).toBe(true)
  })
})

describe('scrollKey', () => {
  it('e a mesma nas abas do mesmo jogador', () => {
    // Act
    const profile = scrollKey('/jogadores/1001')
    const metrics = scrollKey('/jogadores/1001/metricas')

    // Assert
    expect(metrics).toBe(profile)
  })

  it('muda de um jogador para outro', () => {
    // Act
    const first = scrollKey('/jogadores/1001')
    const second = scrollKey('/jogadores/1002')

    // Assert
    expect(second).not.toBe(first)
  })

  it('muda entre paginas diferentes', () => {
    // Act
    const search = scrollKey('/busca')
    const shortlists = scrollKey('/shortlists')

    // Assert
    expect(shortlists).not.toBe(search)
  })
})
