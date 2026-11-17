import { describe, expect, it } from 'vitest'
import type { components } from '../api/schema'
import {
  derivarRecortes,
  encontrarRecorte,
  recorteParaBusca,
  recorteParaParams,
  rotuloDoRecorte,
  validarBuscaDoRecorte,
} from './recorte'
import type { Perfil } from '../interfaces/jogador'
import type { Recorte } from '../interfaces/recorte'

type Schemas = components['schemas']

const BRASILEIRAO = { id: 325, name: 'Brasileirão Série A' }
const ELIMINATORIAS = { id: 295, name: 'Eliminatórias Sul-Americanas' }
const ATLETICO_SERRANO = 1960
const BRASIL = 4748

const itemDeStats = (dados: {
  competicao: { id: number; name: string }
  temporadaId: number
  year: string
  teamId: number
  minutos?: number
}): Schemas['SofaSeasonStatisticItem'] => ({
  year: dados.year,
  team: { id: dados.teamId, name: `Time ${dados.teamId}`, gender: 'M' },
  uniqueTournament: {
    id: dados.competicao.id,
    name: dados.competicao.name,
    competitionType: 'league',
    category: {} as Schemas['SofaCategorySummary'],
  },
  season: { id: dados.temporadaId, name: dados.year },
  statistics: {
    rating: 7,
    appearances: 10,
    goals: 1,
    assists: 1,
    minutesPlayed: dados.minutos ?? 900,
    expectedGoals: null,
    expectedAssists: null,
    accuratePassesPercentage: 85,
    keyPasses: 10,
    tackles: 10,
    interceptions: 10,
    yellowCards: 0,
    redCards: 0,
  },
})

const selecao = (teamId: number): Schemas['SofaNationalTeamStats'] => ({
  team: { id: teamId, name: 'Brasil', nameCode: 'BRA', ranking: 5, national: true },
  appearances: 12,
  goals: 2,
  debutTimestamp: 1_600_000_000,
})

describe('derivarRecortes', () => {
  it('cria um recorte por item de stats', () => {
    // Arrange
    const perfil: Perfil = {
      stats: [
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 72034, year: '2025', teamId: ATLETICO_SERRANO, minutos: 1284 }),
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 58766, year: '2024', teamId: ATLETICO_SERRANO }),
        itemDeStats({ competicao: ELIMINATORIAS, temporadaId: 53820, year: '2025', teamId: BRASIL }),
      ],
      nationalTeamStats: [selecao(BRASIL)],
    }

    // Act
    const recortes = derivarRecortes(perfil)

    // Assert
    expect(recortes).toHaveLength(3)
    expect(recortes).toContainEqual({
      competicaoId: 325,
      temporadaId: 72034,
      contexto: 'Clube',
      competicao: 'Brasileirão Série A',
      temporada: '2025',
      minutosJogados: 1284,
    })
  })

  it('marca como selecao o item cujo time aparece em nationalTeamStats', () => {
    // Arrange
    const perfil: Perfil = {
      stats: [
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 72034, year: '2025', teamId: ATLETICO_SERRANO }),
        itemDeStats({ competicao: ELIMINATORIAS, temporadaId: 53820, year: '2025', teamId: BRASIL }),
      ],
      nationalTeamStats: [selecao(BRASIL)],
    }

    // Act
    const recortes = derivarRecortes(perfil)

    // Assert
    const contextoPorCompeticao = Object.fromEntries(recortes.map((r) => [r.competicaoId, r.contexto]))
    expect(contextoPorCompeticao).toEqual({ 325: 'Clube', 295: 'Selecao' })
  })

  it.each([
    ['ausente', undefined],
    ['nulo', null],
    ['vazio', []],
  ])('marca tudo como clube com nationalTeamStats %s', (_caso, nationalTeamStats) => {
    // Arrange
    const perfil: Perfil = {
      stats: [
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 72034, year: '2025', teamId: ATLETICO_SERRANO }),
        itemDeStats({ competicao: ELIMINATORIAS, temporadaId: 53820, year: '2025', teamId: BRASIL }),
      ],
      nationalTeamStats,
    }

    // Act
    const recortes = derivarRecortes(perfil)

    // Assert
    expect(recortes.map((r) => r.contexto)).toEqual(['Clube', 'Clube'])
  })

  it.each([
    ['ausente', undefined],
    ['nulo', null],
    ['vazio', []],
  ])('devolve lista vazia com stats %s', (_caso, stats) => {
    // Arrange
    const perfil: Perfil = { stats, nationalTeamStats: [selecao(BRASIL)] }

    // Act
    const recortes = derivarRecortes(perfil)

    // Assert
    expect(recortes).toEqual([])
  })
})

describe('ordem dos recortes', () => {
  it('ordena da temporada mais recente para a mais antiga', () => {
    // Arrange
    const perfil: Perfil = {
      stats: [
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 48982, year: '2023', teamId: ATLETICO_SERRANO }),
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 72034, year: '2025', teamId: ATLETICO_SERRANO }),
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 58766, year: '2024', teamId: ATLETICO_SERRANO }),
      ],
    }

    // Act
    const recortes = derivarRecortes(perfil)

    // Assert
    expect(recortes.map((r) => r.temporadaId)).toEqual([72034, 58766, 48982])
  })

  it('desempata a mesma temporada pelos minutos jogados', () => {
    // Arrange
    const perfil: Perfil = {
      stats: [
        itemDeStats({ competicao: ELIMINATORIAS, temporadaId: 72034, year: '2025', teamId: BRASIL, minutos: 312 }),
        itemDeStats({ competicao: BRASILEIRAO, temporadaId: 72034, year: '2025', teamId: ATLETICO_SERRANO, minutos: 1284 }),
      ],
      nationalTeamStats: [selecao(BRASIL)],
    }

    // Act
    const recortes = derivarRecortes(perfil)

    // Assert
    expect(recortes.map((r) => r.minutosJogados)).toEqual([1284, 312])
  })
})

const recorte = (dados: Partial<Recorte> = {}): Recorte => ({
  competicaoId: 325,
  temporadaId: 72034,
  contexto: 'Clube',
  competicao: 'Brasileirão Série A',
  temporada: '2025',
  minutosJogados: 1284,
  ...dados,
})

const eliminatorias = recorte({
  competicaoId: 295,
  temporadaId: 53820,
  contexto: 'Selecao',
  competicao: 'Eliminatórias Sul-Americanas',
  minutosJogados: 312,
})

describe('rotuloDoRecorte', () => {
  it('mostra competicao e ano quando o jogador so tem recortes de clube', () => {
    // Arrange
    const lista = [recorte(), recorte({ temporadaId: 58766, temporada: '2024' })]

    // Act
    const rotulo = rotuloDoRecorte(lista[0], lista)

    // Assert
    expect(rotulo).toBe('Brasileirão Série A · 2025')
  })

  it('comeca pelo contexto quando o jogador tem algum recorte de selecao', () => {
    // Arrange
    const lista = [recorte(), eliminatorias]

    // Act
    const rotulos = lista.map((r) => rotuloDoRecorte(r, lista))

    // Assert
    expect(rotulos).toEqual([
      'Clube · Brasileirão Série A · 2025',
      'Seleção · Eliminatórias Sul-Americanas · 2025',
    ])
  })

  it('comeca pelo contexto quando todos os recortes sao de selecao', () => {
    // Arrange
    const lista = [eliminatorias]

    // Act
    const rotulo = rotuloDoRecorte(eliminatorias, lista)

    // Assert
    expect(rotulo).toBe('Seleção · Eliminatórias Sul-Americanas · 2025')
  })
})

describe('validarBuscaDoRecorte', () => {
  it('aceita um recorte completo', () => {
    // Act
    const busca = validarBuscaDoRecorte({ competicao: 325, temporada: 72034, contexto: 'Selecao' })

    // Assert
    expect(busca).toEqual({ competicao: 325, temporada: 72034, contexto: 'Selecao' })
  })

  it('devolve tudo ausente sem search params', () => {
    // Act
    const busca = validarBuscaDoRecorte({})

    // Assert
    expect(busca).toEqual({ competicao: undefined, temporada: undefined, contexto: undefined })
  })

  it.each([
    ['competicao', 'abc'],
    ['competicao', 0],
    ['competicao', -3],
    ['competicao', 1.5],
    ['temporada', '72034'],
    ['contexto', 'foo'],
    ['contexto', 'selecao'],
  ])('trata %s=%s como ausente', (chave, valor) => {
    // Arrange
    const entrada = { competicao: 325, temporada: 72034, contexto: 'Clube', [chave]: valor }

    // Act
    const busca = validarBuscaDoRecorte(entrada)

    // Assert
    expect(busca[chave as keyof typeof busca]).toBeUndefined()
  })
})

describe('encontrarRecorte', () => {
  const lista = [recorte(), eliminatorias]

  it('encontra o recorte que bate nos tres campos', () => {
    // Act
    const encontrado = encontrarRecorte(lista, { competicao: 295, temporada: 53820, contexto: 'Selecao' })

    // Assert
    expect(encontrado).toBe(eliminatorias)
  })

  it('nao encontra quando o contexto difere', () => {
    // Act
    const encontrado = encontrarRecorte(lista, { competicao: 295, temporada: 53820, contexto: 'Clube' })

    // Assert
    expect(encontrado).toBeUndefined()
  })

  it('nao encontra um recorte que nao existe em stats', () => {
    // Act
    const encontrado = encontrarRecorte(lista, { competicao: 17, temporada: 61627, contexto: 'Clube' })

    // Assert
    expect(encontrado).toBeUndefined()
  })

  it('nao encontra com a busca incompleta', () => {
    // Act
    const encontrado = encontrarRecorte(lista, { competicao: 325, temporada: 72034 })

    // Assert
    expect(encontrado).toBeUndefined()
  })
})

describe('conversao do recorte', () => {
  it('vira search params em portugues', () => {
    // Act
    const busca = recorteParaBusca(eliminatorias)

    // Assert
    expect(busca).toEqual({ competicao: 295, temporada: 53820, contexto: 'Selecao' })
  })

  it('vira os parametros de query do contrato', () => {
    // Act
    const params = recorteParaParams(eliminatorias)

    // Assert
    expect(params).toEqual({ CompeticaoId: 295, TemporadaId: 53820, Contexto: 'Selecao' })
  })
})
