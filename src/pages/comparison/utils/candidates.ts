import type { SearchPlayer } from '../../../utils/searchResults'

export const comparableResults = (
  _players: SearchPlayer[],
  _pagePlayerId: number,
  _pageLetter?: string | null,
): SearchPlayer[] => {
  throw new Error('not implemented')
}

export const filterNote = (_pageLetter?: string | null): string => {
  throw new Error('not implemented')
}

export const noComparableText = (_pageLetter: string | null | undefined, _term: string): string => {
  throw new Error('not implemented')
}
