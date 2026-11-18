import type { components } from '../../api/schema'
import type { PlayerProfile } from '../../interfaces/player'

type Schemas = components['schemas']

export const ATLETICO_SERRANO = 1960
export const BRASIL = 4748

export const BRASILEIRAO = { id: 325, name: 'Brasileirão Série A' }
export const COPA_DO_BRASIL = { id: 373, name: 'Copa do Brasil' }
export const ELIMINATORIAS = { id: 295, name: 'Eliminatórias Sul-Americanas' }
export const COPA_AMERICA = { id: 133, name: 'Copa América' }

export const SEASON_2025 = 72034
export const SEASON_2024 = 58766
export const SEASON_2024_NATIONAL = 57478

const team = (id: number, name: string): Schemas['SofaTeam'] => ({ id, name, gender: 'M' })

const statsItem = (data: {
  competition: { id: number; name: string }
  seasonId: number
  year: string
  team: Schemas['SofaTeam']
  minutes: number
}): Schemas['SofaSeasonStatisticItem'] => ({
  year: data.year,
  team: data.team,
  uniqueTournament: {
    id: data.competition.id,
    name: data.competition.name,
    competitionType: 'league',
    category: { name: 'Brasil', flag: 'brazil' },
  },
  season: { id: data.seasonId, name: data.year },
  statistics: {
    rating: 7.12,
    appearances: Math.round(data.minutes / 80),
    goals: 4,
    assists: 3,
    minutesPlayed: data.minutes,
    expectedGoals: null,
    expectedAssists: null,
    accuratePassesPercentage: 86.4,
    keyPasses: 26,
    tackles: 30,
    interceptions: 20,
    yellowCards: 3,
    redCards: 0,
  },
})

const details = (data: {
  id: number
  name: string
  position: string
  dateOfBirth: string
  club: string
}): Schemas['SofaPlayerDetail'] => ({
  id: data.id,
  name: data.name,
  slug: data.name.toLowerCase().replaceAll(' ', '-'),
  team: {
    id: ATLETICO_SERRANO,
    name: data.club,
    nameCode: 'ASE',
    tournament: { id: BRASILEIRAO.id, name: BRASILEIRAO.name },
    national: false,
    userCount: 120_000,
  },
  position: data.position,
  positionsDetailed: [],
  jerseyNumber: '8',
  height: 178,
  dateOfBirth: data.dateOfBirth,
  preferredFoot: 'Right',
  userCount: 15_000,
  proposedMarketValue: 12_500_000,
  proposedMarketValueRaw: { value: 12_500_000, currency: 'EUR' },
})

const brazilNationalTeam: Schemas['SofaNationalTeamStats'] = {
  team: { id: BRASIL, name: 'Brasil', nameCode: 'BRA', ranking: 5, national: true },
  appearances: 12,
  goals: 2,
  debutTimestamp: 1_662_000_000,
}

const club = team(ATLETICO_SERRANO, 'Atlético Serrano')
const brazil = team(BRASIL, 'Brasil')

const SERRA_AZUL = { id: 2210, name: 'Serra Azul', shortName: 'Serra' }
const SERRANO = { id: ATLETICO_SERRANO, name: 'Atlético Serrano', shortName: 'Serrano' }
const SERRANO_SUB_20 = { id: 1961, name: 'Atlético Serrano Sub-20', shortName: 'Serrano Sub-20' }

const seconds = (year: number, month: number) => Date.UTC(year, month - 1, 15) / 1000

const transfer = (data: {
  id: number
  from: Schemas['SofaTransferTeam']
  to: Schemas['SofaTransferTeam']
  year: number
  month: number
  fee?: number
  description?: string
}): Schemas['SofaTransfer'] => ({
  id: data.id,
  fromTeamName: data.from.name,
  toTeamName: data.to.name,
  transferFrom: data.from,
  transferTo: data.to,
  transferFeeDescription: data.description ?? null,
  transferDateTimestamp: seconds(data.year, data.month),
  transferFeeRaw: data.fee ? { value: data.fee, currency: 'EUR' } : null,
})

const fullTransfers: Schemas['SofaTransfer'][] = [
  transfer({ id: 3, from: SERRA_AZUL, to: SERRANO, year: 2024, month: 1, fee: 3_200_000 }),
  transfer({ id: 2, from: SERRANO, to: SERRA_AZUL, year: 2022, month: 7, description: 'Loan' }),
  transfer({ id: 1, from: SERRANO_SUB_20, to: SERRANO, year: 2020, month: 1, description: '-' }),
]

export const buildFullProfile = (id = 1001, name = 'Rafael Montes'): PlayerProfile => ({
  details: {
    ...details({ id, name, position: 'M', dateOfBirth: '1999-03-14T00:00:00Z', club: 'Atlético Serrano' }),
    positionsDetailed: ['MC', 'ME'],
  },
  stats: [
    statsItem({ competition: BRASILEIRAO, seasonId: SEASON_2025, year: '2025', team: club, minutes: 1284 }),
    statsItem({ competition: ELIMINATORIAS, seasonId: SEASON_2025, year: '2025', team: brazil, minutes: 540 }),
    statsItem({ competition: COPA_DO_BRASIL, seasonId: SEASON_2025, year: '2025', team: club, minutes: 312 }),
    statsItem({ competition: BRASILEIRAO, seasonId: SEASON_2024, year: '2024', team: club, minutes: 2410 }),
  ],
  nationalTeamStats: [brazilNationalTeam],
  historyTransfer: fullTransfers,
  playerImage: null,
})

const MANY_COMPETITIONS = [
  { id: 325, name: 'Brasileirão Série A' },
  { id: 373, name: 'Copa do Brasil' },
  { id: 384, name: 'Copa Libertadores' },
  { id: 341, name: 'Trophée des Champions' },
  { id: 372, name: 'Paulistão' },
  { id: 480, name: 'Copa Sul-Americana' },
  { id: 390, name: 'Brasileirão Série B' },
]

const MANY_SEASONS = [
  { id: 87678, year: '2026' },
  { id: 92399, year: '20/21' },
]

export const buildManyRecortesProfile = (id = 1006): PlayerProfile => ({
  details: details({ id, name: 'Diego Albuquerque', position: 'F', dateOfBirth: '1996-08-09T00:00:00Z', club: 'Atlético Serrano' }),
  stats: MANY_SEASONS.flatMap((season) =>
    MANY_COMPETITIONS.map((competition, index) =>
      statsItem({ competition, seasonId: season.id - index, year: season.year, team: club, minutes: 900 - index * 60 }),
    ),
  ),
  nationalTeamStats: [],
  historyTransfer: Array.from({ length: 8 }, (_, index) =>
    transfer({
      id: 100 + index,
      from: index % 2 === 0 ? SERRA_AZUL : SERRANO,
      to: index % 2 === 0 ? SERRANO : SERRA_AZUL,
      year: 2025 - index,
      month: 7,
      fee: (index + 1) * 500_000,
    }),
  ),
  playerImage: null,
})

export const buildSparseProfile = (id = 1007): PlayerProfile => {
  const base = details({ id, name: 'Miguel Torres', position: 'D', dateOfBirth: '', club: 'Atlético Serrano' })
  return {
    details: {
      ...base,
      height: 0,
      jerseyNumber: null,
      preferredFoot: 'Unknown',
      proposedMarketValue: 0,
      proposedMarketValueRaw: null,
    },
    stats: [statsItem({ competition: BRASILEIRAO, seasonId: SEASON_2025, year: '2025', team: club, minutes: 980 })],
    nationalTeamStats: [],
    historyTransfer: [],
    playerImage: null,
  }
}

export const buildNationalTeamOnlyProfile = (id = 1002): PlayerProfile => ({
  details: details({ id, name: 'Caio Ventura', position: 'F', dateOfBirth: '2001-07-02T00:00:00Z', club: 'Atlético Serrano' }),
  stats: [
    statsItem({ competition: ELIMINATORIAS, seasonId: SEASON_2025, year: '2025', team: brazil, minutes: 720 }),
    statsItem({ competition: COPA_AMERICA, seasonId: SEASON_2024_NATIONAL, year: '2024', team: brazil, minutes: 410 }),
  ],
  nationalTeamStats: [brazilNationalTeam],
  historyTransfer: [],
  playerImage: null,
})

export const buildProfileWithoutStats = (id = 1003): PlayerProfile => ({
  details: details({ id, name: 'Lucas Prado', position: 'D', dateOfBirth: '2005-01-20T00:00:00Z', club: 'Atlético Serrano' }),
  stats: [],
  nationalTeamStats: [],
  historyTransfer: [],
  playerImage: null,
})
