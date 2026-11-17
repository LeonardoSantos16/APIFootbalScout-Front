import { describe, expect, it } from 'vitest'
import type { components } from '../api/schema'
import type { PlayerProfile } from '../interfaces/player'
import type { Slice } from '../interfaces/slice'
import {
  deriveSlices,
  findSlice,
  sliceLabel,
  sliceToQuery,
  sliceToSearch,
  validateSliceSearch,
} from './slice'

type Schemas = components['schemas']

const BRASILEIRAO = { id: 325, name: 'Brasileirão Série A' }
const ELIMINATORIAS = { id: 295, name: 'Eliminatórias Sul-Americanas' }
const ATLETICO_SERRANO = 1960
const BRASIL = 4748

const statsItem = (data: {
  competition: { id: number; name: string }
  seasonId: number
  year: string
  teamId: number
  minutes?: number
}): Schemas['SofaSeasonStatisticItem'] => ({
  year: data.year,
  team: { id: data.teamId, name: `Time ${data.teamId}`, gender: 'M' },
  uniqueTournament: {
    id: data.competition.id,
    name: data.competition.name,
    competitionType: 'league',
    category: {} as Schemas['SofaCategorySummary'],
  },
  season: { id: data.seasonId, name: data.year },
  statistics: {
    rating: 7,
    appearances: 10,
    goals: 1,
    assists: 1,
    minutesPlayed: data.minutes ?? 900,
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

const nationalTeam = (teamId: number): Schemas['SofaNationalTeamStats'] => ({
  team: { id: teamId, name: 'Brasil', nameCode: 'BRA', ranking: 5, national: true },
  appearances: 12,
  goals: 2,
  debutTimestamp: 1_600_000_000,
})

describe('deriveSlices', () => {
  it('cria um recorte por item de stats', () => {
    // Arrange
    const profile: PlayerProfile = {
      stats: [
        statsItem({ competition: BRASILEIRAO, seasonId: 72034, year: '2025', teamId: ATLETICO_SERRANO, minutes: 1284 }),
        statsItem({ competition: BRASILEIRAO, seasonId: 58766, year: '2024', teamId: ATLETICO_SERRANO }),
        statsItem({ competition: ELIMINATORIAS, seasonId: 53820, year: '2025', teamId: BRASIL }),
      ],
      nationalTeamStats: [nationalTeam(BRASIL)],
    }

    // Act
    const slices = deriveSlices(profile)

    // Assert
    expect(slices).toHaveLength(3)
    expect(slices).toContainEqual({
      competitionId: 325,
      seasonId: 72034,
      context: 'Clube',
      competition: 'Brasileirão Série A',
      season: '2025',
      minutesPlayed: 1284,
    })
  })

  it('marca como selecao o item cujo time aparece em nationalTeamStats', () => {
    // Arrange
    const profile: PlayerProfile = {
      stats: [
        statsItem({ competition: BRASILEIRAO, seasonId: 72034, year: '2025', teamId: ATLETICO_SERRANO }),
        statsItem({ competition: ELIMINATORIAS, seasonId: 53820, year: '2025', teamId: BRASIL }),
      ],
      nationalTeamStats: [nationalTeam(BRASIL)],
    }

    // Act
    const slices = deriveSlices(profile)

    // Assert
    const contextByCompetition = Object.fromEntries(slices.map((s) => [s.competitionId, s.context]))
    expect(contextByCompetition).toEqual({ 325: 'Clube', 295: 'Selecao' })
  })

  it.each([
    ['ausente', undefined],
    ['nulo', null],
    ['vazio', []],
  ])('marca tudo como clube com nationalTeamStats %s', (_case, nationalTeamStats) => {
    // Arrange
    const profile: PlayerProfile = {
      stats: [
        statsItem({ competition: BRASILEIRAO, seasonId: 72034, year: '2025', teamId: ATLETICO_SERRANO }),
        statsItem({ competition: ELIMINATORIAS, seasonId: 53820, year: '2025', teamId: BRASIL }),
      ],
      nationalTeamStats,
    }

    // Act
    const slices = deriveSlices(profile)

    // Assert
    expect(slices.map((s) => s.context)).toEqual(['Clube', 'Clube'])
  })

  it.each([
    ['ausente', undefined],
    ['nulo', null],
    ['vazio', []],
  ])('devolve lista vazia com stats %s', (_case, stats) => {
    // Arrange
    const profile: PlayerProfile = { stats, nationalTeamStats: [nationalTeam(BRASIL)] }

    // Act
    const slices = deriveSlices(profile)

    // Assert
    expect(slices).toEqual([])
  })
})

describe('ordem dos recortes', () => {
  it('mantem a ordem da fonte mesmo com season.id fora da ordem cronologica', () => {
    // Arrange
    const profile: PlayerProfile = {
      stats: [
        statsItem({ competition: BRASILEIRAO, seasonId: 87678, year: '2026', teamId: ATLETICO_SERRANO }),
        statsItem({ competition: { id: 341, name: 'Trophée des Champions' }, seasonId: 92399, year: '20/21', teamId: ATLETICO_SERRANO }),
        statsItem({ competition: BRASILEIRAO, seasonId: 58766, year: '2024', teamId: ATLETICO_SERRANO }),
      ],
    }

    // Act
    const slices = deriveSlices(profile)

    // Assert
    expect(slices.map((s) => s.seasonId)).toEqual([87678, 92399, 58766])
  })

  it('nao reordena a mesma temporada pelos minutos jogados', () => {
    // Arrange
    const profile: PlayerProfile = {
      stats: [
        statsItem({ competition: ELIMINATORIAS, seasonId: 72034, year: '2025', teamId: BRASIL, minutes: 312 }),
        statsItem({ competition: BRASILEIRAO, seasonId: 72034, year: '2025', teamId: ATLETICO_SERRANO, minutes: 1284 }),
      ],
      nationalTeamStats: [nationalTeam(BRASIL)],
    }

    // Act
    const slices = deriveSlices(profile)

    // Assert
    expect(slices.map((s) => s.minutesPlayed)).toEqual([312, 1284])
  })
})

const slice = (data: Partial<Slice> = {}): Slice => ({
  competitionId: 325,
  seasonId: 72034,
  context: 'Clube',
  competition: 'Brasileirão Série A',
  season: '2025',
  minutesPlayed: 1284,
  ...data,
})

const eliminatorias = slice({
  competitionId: 295,
  seasonId: 53820,
  context: 'Selecao',
  competition: 'Eliminatórias Sul-Americanas',
  minutesPlayed: 312,
})

describe('sliceLabel', () => {
  it('mostra competicao e ano quando o jogador so tem recortes de clube', () => {
    // Arrange
    const slices = [slice(), slice({ seasonId: 58766, season: '2024' })]

    // Act
    const label = sliceLabel(slices[0], slices)

    // Assert
    expect(label).toBe('Brasileirão Série A · 2025')
  })

  it('comeca pelo contexto quando o jogador tem algum recorte de selecao', () => {
    // Arrange
    const slices = [slice(), eliminatorias]

    // Act
    const labels = slices.map((s) => sliceLabel(s, slices))

    // Assert
    expect(labels).toEqual([
      'Clube · Brasileirão Série A · 2025',
      'Seleção · Eliminatórias Sul-Americanas · 2025',
    ])
  })

  it('comeca pelo contexto quando todos os recortes sao de selecao', () => {
    // Arrange
    const slices = [eliminatorias]

    // Act
    const label = sliceLabel(eliminatorias, slices)

    // Assert
    expect(label).toBe('Seleção · Eliminatórias Sul-Americanas · 2025')
  })
})

describe('validateSliceSearch', () => {
  it('aceita um recorte completo', () => {
    // Act
    const search = validateSliceSearch({ competicao: 325, temporada: 72034, contexto: 'Selecao' })

    // Assert
    expect(search).toEqual({ competicao: 325, temporada: 72034, contexto: 'Selecao' })
  })

  it('devolve tudo ausente sem search params', () => {
    // Act
    const search = validateSliceSearch({})

    // Assert
    expect(search).toEqual({ competicao: undefined, temporada: undefined, contexto: undefined })
  })

  it.each([
    ['competicao', 'abc'],
    ['competicao', 0],
    ['competicao', -3],
    ['competicao', 1.5],
    ['temporada', '72034'],
    ['contexto', 'foo'],
    ['contexto', 'selecao'],
  ])('trata %s=%s como ausente', (key, value) => {
    // Arrange
    const input = { competicao: 325, temporada: 72034, contexto: 'Clube', [key]: value }

    // Act
    const search = validateSliceSearch(input)

    // Assert
    expect(search[key as keyof typeof search]).toBeUndefined()
  })
})

describe('findSlice', () => {
  const slices = [slice(), eliminatorias]

  it('encontra o recorte que bate nos tres campos', () => {
    // Act
    const found = findSlice(slices, { competicao: 295, temporada: 53820, contexto: 'Selecao' })

    // Assert
    expect(found).toBe(eliminatorias)
  })

  it('nao encontra quando o contexto difere', () => {
    // Act
    const found = findSlice(slices, { competicao: 295, temporada: 53820, contexto: 'Clube' })

    // Assert
    expect(found).toBeUndefined()
  })

  it('nao encontra um recorte que nao existe em stats', () => {
    // Act
    const found = findSlice(slices, { competicao: 17, temporada: 61627, contexto: 'Clube' })

    // Assert
    expect(found).toBeUndefined()
  })

  it('nao encontra com a busca incompleta', () => {
    // Act
    const found = findSlice(slices, { competicao: 325, temporada: 72034 })

    // Assert
    expect(found).toBeUndefined()
  })
})

describe('conversao do recorte', () => {
  it('vira search params em portugues', () => {
    // Act
    const search = sliceToSearch(eliminatorias)

    // Assert
    expect(search).toEqual({ competicao: 295, temporada: 53820, contexto: 'Selecao' })
  })

  it('vira os parametros de query do contrato', () => {
    // Act
    const query = sliceToQuery(eliminatorias)

    // Assert
    expect(query).toEqual({ CompeticaoId: 295, TemporadaId: 53820, Contexto: 'Selecao' })
  })
})
