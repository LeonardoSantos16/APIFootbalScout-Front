import type { components } from '../../../api/schema'
import { positionFromLetter } from '../../../utils/player'

type Schemas = components['schemas']

export type SearchPlayer = Schemas['SofaEntity']

const PLAYER_TYPE = 'player'

export const playerResults = (response: Schemas['SofaSearchResponse']): SearchPlayer[] =>
  (response.results ?? []).filter((result) => result.type === PLAYER_TYPE).map((result) => result.entity)

export const resultSummary = (player: SearchPlayer): string =>
  [positionFromLetter(player.position), player.team?.name, player.country?.name].filter(Boolean).join(', ')
