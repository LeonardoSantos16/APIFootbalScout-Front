import type { components } from '../api/schema'

export type SliceContext = components['schemas']['ContextoDeRecorteDto']

export interface Slice {
  competitionId: number
  seasonId: number
  context: SliceContext
  competition: string
  season: string
  minutesPlayed: number
}

export interface SliceSearch {
  competicao?: number
  temporada?: number
  contexto?: SliceContext
}
