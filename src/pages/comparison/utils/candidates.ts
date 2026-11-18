import { compatiblePositions, positionFromLetter } from '../../../utils/player'
import type { SearchPlayer } from '../../../utils/searchResults'

export const comparableResults = (
  players: SearchPlayer[],
  pagePlayerId: number,
  pageLetter?: string | null,
): SearchPlayer[] => {
  const compatible = compatiblePositions(pageLetter)
  return players.filter(
    (player) => player.id !== pagePlayerId && player.position != null && compatible.includes(player.position),
  )
}

const lowerPosition = (letter?: string | null) => positionFromLetter(letter)?.toLowerCase()

export const filterNote = (pageLetter?: string | null): string => {
  const position = lowerPosition(pageLetter)
  return position ? `Mostrando só jogadores comparáveis com ${position}.` : 'Mostrando só jogadores comparáveis.'
}

export const noComparableText = (pageLetter: string | null | undefined, term: string): string => {
  const position = lowerPosition(pageLetter)
  return position
    ? `Nenhum jogador comparável com ${position} para "${term}".`
    : `Nenhum jogador comparável para "${term}".`
}
