import type { Row } from '../../../components/RowList/RowList'
import type { PlayerProfile } from '../../../interfaces/player'
import type { Slice } from '../../../interfaces/slice'
import { formatDecimal } from '../../../utils/number'
import { deriveSlices, sliceLabel } from '../../../utils/slice'

export interface SliceRow extends Row {
  slice: Slice
}

const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const count = (value: number, singular: string, plural: string) => ({
  value: integer.format(value),
  label: value === 1 ? singular : plural,
})

export const sliceRows = (profile: PlayerProfile): SliceRow[] => {
  const stats = profile.stats ?? []
  const slices = deriveSlices(profile)

  return slices.map((slice, index) => {
    const { statistics } = stats[index]
    return {
      id: `${slice.competitionId}-${slice.seasonId}-${slice.context}`,
      title: sliceLabel(slice, slices),
      slice,
      cells: [
        count(statistics.appearances, 'jogo', 'jogos'),
        { value: integer.format(statistics.minutesPlayed), label: 'min' },
        count(statistics.goals, 'gol', 'gols'),
        { value: integer.format(statistics.assists), label: 'assist.' },
        { value: formatDecimal(statistics.rating, 2), label: 'nota', labelBefore: true },
      ],
    }
  })
}
