import { useEffect, useEffectEvent, useMemo } from 'react'
import type { SelectOption } from '../components/Select/Select'
import type { Slice, SliceChangeOptions, SliceSearch } from '../interfaces/slice'
import { deriveSlices, findSlice, sliceLabel } from '../utils/slice'
import { usePlayerProfile } from './usePlayerProfile'

export const SLICE_SELECT_LABEL = 'Competição e temporada'

const sliceKey = (slice: Slice) => `${slice.competitionId}-${slice.seasonId}-${slice.context}`

export const useSliceSelection = (
  playerId: number,
  search: SliceSearch,
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void,
) => {
  const profile = usePlayerProfile(playerId)
  const slices = useMemo(() => (profile.data ? deriveSlices(profile.data) : []), [profile.data])
  const selected = findSlice(slices, search)
  const fallback = slices[0]
  const shouldCorrect = !selected && fallback !== undefined

  const correctSlice = useEffectEvent(() => {
    if (fallback) onSliceChange(fallback, { replace: true })
  })

  useEffect(() => {
    if (shouldCorrect) correctSlice()
  }, [shouldCorrect])

  const current = selected ?? fallback
  const options: SelectOption[] = slices.map((slice) => ({ value: sliceKey(slice), label: sliceLabel(slice, slices) }))
  const select = (key: string) => {
    const slice = slices.find((item) => sliceKey(item) === key)
    if (slice) onSliceChange(slice)
  }

  return {
    profile,
    slices,
    selected,
    options,
    value: current ? sliceKey(current) : undefined,
    select,
  }
}
