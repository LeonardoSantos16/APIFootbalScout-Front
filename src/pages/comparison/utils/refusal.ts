import type { ComparisonPlayers, ComparisonResponse, RefusedPlayer } from '../interfaces/comparison'

export const refusedPlayers = (
  _response: ComparisonResponse,
  _players: ComparisonPlayers,
): [RefusedPlayer, RefusedPlayer] => {
  throw new Error('not implemented')
}

export const refusalMessage = (
  _response: ComparisonResponse,
  _players: ComparisonPlayers,
  _pageMinutes?: number,
): string => {
  throw new Error('not implemented')
}
