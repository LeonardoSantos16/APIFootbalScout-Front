import { describe, expect, it } from 'vitest'
import type { components } from '../api/schema'
import { derivarRecortes, type Perfil } from './recorte'

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
