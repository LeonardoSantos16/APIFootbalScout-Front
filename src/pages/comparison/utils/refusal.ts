import { MIN_SAMPLE_MINUTES } from '../../../config/scout'
import { MINIMUM_SAMPLE_TEXT } from '../../../utils/attributes'
import { formatDecimal } from '../../../utils/number'
import { positionLabel } from '../../../utils/player'
import type { ComparisonPlayers, ComparisonResponse, RefusedPlayer } from '../interfaces/comparison'

const UNKNOWN_POSITION = 'Posição não informada'

const playerOf = (response: ComparisonResponse, playerId: number) => response.jogadores[String(playerId)]

export const refusedPlayers = (
  response: ComparisonResponse,
  players: ComparisonPlayers,
): [RefusedPlayer, RefusedPlayer] => {
  const describe = (playerId: number): RefusedPlayer => {
    const player = playerOf(response, playerId)
    return { name: player?.nome ?? '', position: positionLabel(player?.posicao) ?? UNKNOWN_POSITION }
  }
  return [describe(players.pageId), describe(players.otherId)]
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const incompatibleText = (response: ComparisonResponse, players: ComparisonPlayers) => {
  const page = positionLabel(playerOf(response, players.pageId)?.posicao)
  const other = positionLabel(playerOf(response, players.otherId)?.posicao)
  if (!page || !other) return 'As posições dos dois jogadores não são comparáveis.'
  return `${capitalize(other)} e ${page.toLowerCase()} não são comparáveis.`
}

const unknownPositionText = (response: ComparisonResponse, players: ComparisonPlayers) => {
  const missing = [players.pageId, players.otherId]
    .map((playerId) => playerOf(response, playerId))
    .filter((player) => !player?.posicao)
  if (missing.length === 1 && missing[0]) return `A fonte não informou a posição de ${missing[0].nome}.`
  return 'A fonte não informou a posição dos dois jogadores.'
}

const insufficientSampleText = (response: ComparisonResponse, players: ComparisonPlayers, pageMinutes?: number) => {
  if (pageMinutes != null && pageMinutes < MIN_SAMPLE_MINUTES) {
    const name = playerOf(response, players.pageId)?.nome
    return `${name} tem ${formatDecimal(pageMinutes, 0)} de ${MINIMUM_SAMPLE_TEXT} nesta competição e temporada.`
  }
  const name = playerOf(response, players.otherId)?.nome
  return `${name} não tem minutos suficientes nesta competição e temporada (mínimo ${MINIMUM_SAMPLE_TEXT}).`
}

export const refusalMessage = (
  response: ComparisonResponse,
  players: ComparisonPlayers,
  pageMinutes?: number,
): string => {
  switch (response.motivo) {
    case 'PosicoesIncompativeis':
      return incompatibleText(response, players)
    case 'PosicaoDesconhecida':
      return unknownPositionText(response, players)
    case 'AmostraInsuficiente':
      return insufficientSampleText(response, players, pageMinutes)
    default:
      return 'Os dados dos dois jogadores não são da mesma competição e temporada.'
  }
}
