import { describe, expect, it } from 'vitest'
import type { ComparisonRefusalReason, ComparisonResponse } from '../interfaces/comparison'
import { refusalMessage, refusedPlayers } from './refusal'

const PLAYERS = { pageId: 1001, otherId: 1004 }

const refused = (
  motivo: ComparisonRefusalReason,
  jogadores: ComparisonResponse['jogadores'] = {
    '1001': { nome: 'Rafael Montes', posicao: 'MeioCampo' },
    '1004': { nome: 'Pedro Nunes', posicao: 'Goleiro' },
  },
): ComparisonResponse => ({ resultado: 'Recusada', motivo, jogadores })

describe('refusalMessage', () => {
  it('explica as posicoes incompativeis', () => {
    // Act
    const text = refusalMessage(refused('PosicoesIncompativeis'), PLAYERS, 1284)

    // Assert
    expect(text).toBe('Goleiro e meio-campo não são comparáveis.')
  })

  it('nomeia o jogador sem posicao', () => {
    // Arrange
    const response = refused('PosicaoDesconhecida', {
      '1001': { nome: 'Rafael Montes', posicao: 'MeioCampo' },
      '1004': { nome: 'Miguel Torres' },
    })

    // Act
    const text = refusalMessage(response, PLAYERS, 1284)

    // Assert
    expect(text).toBe('A fonte não informou a posição de Miguel Torres.')
  })

  it('fala dos dois quando nenhum tem posicao', () => {
    // Arrange
    const response = refused('PosicaoDesconhecida', {
      '1001': { nome: 'Rafael Montes' },
      '1004': { nome: 'Miguel Torres' },
    })

    // Act
    const text = refusalMessage(response, PLAYERS, 1284)

    // Assert
    expect(text).toBe('A fonte não informou a posição dos dois jogadores.')
  })

  it('atribui a falta de amostra ao segundo jogador quando o da pagina tem minutos', () => {
    // Act
    const text = refusalMessage(refused('AmostraInsuficiente'), PLAYERS, 1920)

    // Assert
    expect(text).toBe('Pedro Nunes não tem minutos suficientes nesta competição e temporada (mínimo 450 min).')
  })

  it('atribui a falta de amostra ao jogador da pagina com os minutos dele', () => {
    // Act
    const text = refusalMessage(refused('AmostraInsuficiente'), PLAYERS, 312)

    // Assert
    expect(text).toBe('Rafael Montes tem 312 de 450 min nesta competição e temporada.')
  })

  it('explica o recorte divergente', () => {
    // Act
    const text = refusalMessage(refused('RecorteDivergente'), PLAYERS, 1284)

    // Assert
    expect(text).toBe('Os dados dos dois jogadores não são da mesma competição e temporada.')
  })
})

describe('refusedPlayers', () => {
  it('lista o jogador da pagina primeiro, com a posicao', () => {
    // Act
    const players = refusedPlayers(refused('PosicoesIncompativeis'), PLAYERS)

    // Assert
    expect(players).toEqual([
      { name: 'Rafael Montes', position: 'Meio-campo' },
      { name: 'Pedro Nunes', position: 'Goleiro' },
    ])
  })

  it('diz quando a posicao nao veio', () => {
    // Arrange
    const response = refused('PosicaoDesconhecida', {
      '1001': { nome: 'Rafael Montes', posicao: 'MeioCampo' },
      '1004': { nome: 'Miguel Torres' },
    })

    // Act
    const players = refusedPlayers(response, PLAYERS)

    // Assert
    expect(players[1]).toEqual({ name: 'Miguel Torres', position: 'Posição não informada' })
  })
})
