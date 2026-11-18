import type { PlayerDetails, Position } from '../interfaces/player'

const POSITION_BY_LETTER: Record<string, string> = {
  G: 'Goleiro',
  D: 'Defesa',
  M: 'Meio-campo',
  F: 'Ataque',
}

export const positionFromLetter = (letter?: string | null): string | undefined =>
  letter ? POSITION_BY_LETTER[letter] : undefined

export const age = (birthDate: string, today: Date): number => {
  const birth = new Date(birthDate)
  const years = today.getUTCFullYear() - birth.getUTCFullYear()
  const hadBirthday =
    today.getUTCMonth() > birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() >= birth.getUTCDate())
  return hadBirthday ? years : years - 1
}

export const playerSummary = (details: PlayerDetails, today: Date): string =>
  [
    positionFromLetter(details.position),
    details.dateOfBirth ? `${age(details.dateOfBirth, today)} anos` : undefined,
    details.team?.name,
  ]
    .filter(Boolean)
    .join(', ')

export const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return `${first}${last}`.toUpperCase()
}

const COMPATIBLE_LETTERS: Record<string, string[]> = {
  G: ['G'],
  D: ['D', 'M'],
  M: ['M', 'D', 'F'],
  F: ['F', 'M'],
}

export const compatiblePositions = (letter?: string | null): string[] =>
  (letter && COMPATIBLE_LETTERS[letter]) || []

const POSITION_LABEL: Record<Position, string> = {
  Goleiro: 'Goleiro',
  Defesa: 'Defesa',
  MeioCampo: 'Meio-campo',
  Ataque: 'Ataque',
}

export const positionLabel = (position?: Position | null): string | undefined =>
  position ? POSITION_LABEL[position] : undefined
