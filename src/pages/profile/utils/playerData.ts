import type { components } from '../../../api/schema'
import type { PlayerProfile } from '../../../interfaces/player'
import { age, positionFromLetter } from '../../../utils/player'

type NationalTeamStats = components['schemas']['SofaNationalTeamStats']

export interface PlayerDataItem {
  label: string
  value: string
}

const FOOT: Record<string, string> = {
  Right: 'Direito',
  Left: 'Esquerdo',
  Both: 'Ambos',
}

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`

export const formatBirth = (birthDate: string, today: Date): string =>
  `${DATE_FORMAT.format(new Date(birthDate))} (${age(birthDate, today)} anos)`

const positionLabel = (detailed: string[] | undefined) =>
  detailed && detailed.length > 0 ? `Posição · ${detailed.join(', ')}` : 'Posição'

const nationalTeamValue = (item: NationalTeamStats) =>
  `${item.team.name}, ${plural(item.appearances, 'jogo', 'jogos')}, ${plural(item.goals, 'gol', 'gols')}`

const isValidDate = (value: string | undefined): value is string =>
  !!value && !Number.isNaN(new Date(value).getTime())

export const playerData = (profile: PlayerProfile, today: Date): PlayerDataItem[] => {
  const details = profile.details
  if (!details) return []

  const position = positionFromLetter(details.position)
  const foot = details.preferredFoot ? FOOT[details.preferredFoot] : undefined
  const items: (PlayerDataItem | undefined)[] = [
    position ? { label: positionLabel(details.positionsDetailed), value: position } : undefined,
    isValidDate(details.dateOfBirth)
      ? { label: 'Nascimento', value: formatBirth(details.dateOfBirth, today) }
      : undefined,
    details.height > 0 ? { label: 'Altura', value: `${details.height} cm` } : undefined,
    foot ? { label: 'Pé preferido', value: foot } : undefined,
    details.jerseyNumber ? { label: 'Camisa', value: details.jerseyNumber } : undefined,
    ...(profile.nationalTeamStats ?? []).map((item) => ({ label: 'Seleção', value: nationalTeamValue(item) })),
  ]

  return items.filter((item): item is PlayerDataItem => item !== undefined)
}
