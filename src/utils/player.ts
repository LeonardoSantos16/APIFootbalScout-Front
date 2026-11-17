import type { PlayerDetails } from '../interfaces/player'

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
