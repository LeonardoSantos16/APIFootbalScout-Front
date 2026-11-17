import type { components } from '../../api/schema'
import { ATLETICO_SERRANO } from './profiles'

type Schemas = components['schemas']

interface PlayerEntry {
  id: number
  name: string
  position: string | null
  club?: string
  country?: string
}

const PLAYERS: PlayerEntry[] = [
  { id: 1001, name: 'Rafael Montes', position: 'M', club: 'Atlético Serrano', country: 'Brasil' },
  { id: 1002, name: 'Caio Ventura', position: 'F', club: 'Atlético Serrano', country: 'Brasil' },
  { id: 1003, name: 'Lucas Prado', position: 'D', club: 'Atlético Serrano', country: 'Brasil' },
  { id: 1004, name: 'Pedro Nunes', position: 'G', country: 'Brasil' },
  { id: 1005, name: 'Bruno Lacerda', position: 'M', club: 'Atlético Serrano', country: 'Brasil' },
  { id: 1006, name: 'Diego Albuquerque', position: 'F', club: 'Atlético Serrano', country: 'Brasil' },
  { id: 1007, name: 'Miguel Torres', position: null },
]

const playerResult = (player: PlayerEntry): Schemas['SofaSearchResult'] => ({
  type: 'player',
  score: 100,
  entity: {
    id: player.id,
    name: player.name,
    shortName: player.name,
    team: player.club ? { id: ATLETICO_SERRANO, name: player.club, gender: 'M' } : null,
    country: player.country ? { name: player.country, alpha2: 'BR' } : null,
    position: player.position,
    jerseyNumber: null,
    sofascoreId: null,
  },
})

export const teamResult = (name = 'Atlético Serrano'): Schemas['SofaSearchResult'] => ({
  type: 'team',
  score: 80,
  entity: {
    id: ATLETICO_SERRANO,
    name,
    shortName: name,
    team: null,
    country: { name: 'Brasil', alpha2: 'BR' },
    position: null,
    jerseyNumber: null,
    sofascoreId: null,
  },
})

export const competitionResult = (): Schemas['SofaSearchResult'] => ({
  type: 'uniqueTournament',
  score: 70,
  entity: {
    id: 325,
    name: 'Brasileirão Série A',
    shortName: 'Brasileirão',
    team: null,
    country: { name: 'Brasil', alpha2: 'BR' },
    position: null,
    jerseyNumber: null,
    sofascoreId: null,
  },
})

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const searchPlayers = (term: string): Schemas['SofaSearchResponse'] => {
  const query = fold(term.trim())
  const players = PLAYERS.filter((player) => fold(player.name).includes(query)).map(playerResult)
  return { results: [...players, teamResult()] }
}

export const allPlayerResults = (): Schemas['SofaSearchResult'][] => PLAYERS.map(playerResult)
