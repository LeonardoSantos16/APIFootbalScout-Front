import { ApiError } from '../api/client'
import { describeError, type DescribedError } from '../api/errors'
import type { components } from '../api/schema'
import { positionFromLetter } from './player'

type Schemas = components['schemas']

export type SearchPlayer = Schemas['SofaEntity']

const PLAYER_TYPE = 'player'

export const playerResults = (response: Schemas['SofaSearchResponse']): SearchPlayer[] =>
  (response.results ?? []).filter((result) => result.type === PLAYER_TYPE).map((result) => result.entity)

export const resultSummary = (player: SearchPlayer): string =>
  [positionFromLetter(player.position), player.team?.name, player.country?.name].filter(Boolean).join(', ')

const SOURCE_DOWN_MESSAGE = 'Não foi possível buscar agora.'

export const describeSearchError = (error: unknown): DescribedError =>
  error instanceof ApiError && error.status === 502
    ? { message: SOURCE_DOWN_MESSAGE, canRetry: true }
    : describeError(error)
