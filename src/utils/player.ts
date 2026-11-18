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

export const compatiblePositions = (_letter?: string | null): string[] => {
  throw new Error('not implemented')
}

export const positionLabel = (_position?: Position | null): string | undefined => {
  throw new Error('not implemented')
}
