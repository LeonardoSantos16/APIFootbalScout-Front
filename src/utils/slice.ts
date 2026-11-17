import type { PlayerProfile } from '../interfaces/player'
import type { Slice, SliceContext, SliceSearch } from '../interfaces/slice'

const CONTEXT_LABEL: Record<SliceContext, string> = {
  Clube: 'Clube',
  Selecao: 'Seleção',
}

const CONTEXTS = Object.keys(CONTEXT_LABEL) as SliceContext[]

const SEPARATOR = ' · '

const byMostRecent = (a: Slice, b: Slice) =>
  b.seasonId - a.seasonId || b.minutesPlayed - a.minutesPlayed

export const deriveSlices = (profile: PlayerProfile): Slice[] => {
  const nationalTeams = new Set((profile.nationalTeamStats ?? []).map((item) => item.team.id))

  return (profile.stats ?? [])
    .map(
      (item): Slice => ({
        competitionId: item.uniqueTournament.id,
        seasonId: item.season.id,
        context: nationalTeams.has(item.team.id) ? 'Selecao' : 'Clube',
        competition: item.uniqueTournament.name,
        season: item.year,
        minutesPlayed: item.statistics.minutesPlayed,
      }),
    )
    .sort(byMostRecent)
}

export const sliceLabel = (slice: Slice, slices: Slice[]): string => {
  const parts = [slice.competition, slice.season]
  const withContext = slices.some((item) => item.context === 'Selecao')
  return (withContext ? [CONTEXT_LABEL[slice.context], ...parts] : parts).join(SEPARATOR)
}

const positiveInteger = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined

const parseContext = (value: unknown): SliceContext | undefined =>
  CONTEXTS.find((item) => item === value)

export const validateSliceSearch = (search: Record<string, unknown>): SliceSearch => ({
  competicao: positiveInteger(search.competicao),
  temporada: positiveInteger(search.temporada),
  contexto: parseContext(search.contexto),
})

export const findSlice = (slices: Slice[], search: SliceSearch): Slice | undefined =>
  slices.find(
    (item) =>
      item.competitionId === search.competicao &&
      item.seasonId === search.temporada &&
      item.context === search.contexto,
  )

export const sliceToSearch = (slice: Slice): Required<SliceSearch> => ({
  competicao: slice.competitionId,
  temporada: slice.seasonId,
  contexto: slice.context,
})

export const sliceToQuery = (slice: Slice) => ({
  CompeticaoId: slice.competitionId,
  TemporadaId: slice.seasonId,
  Contexto: slice.context,
})
