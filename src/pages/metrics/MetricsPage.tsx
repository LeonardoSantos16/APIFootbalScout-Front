import type { Slice, SliceSearch } from '../../interfaces/slice'

export interface SliceChangeOptions {
  replace?: boolean
}

export interface MetricsPageProps {
  playerId: number
  search: SliceSearch
  onSliceChange: (slice: Slice, options?: SliceChangeOptions) => void
}

export const MetricsPage = (_props: MetricsPageProps) => null
