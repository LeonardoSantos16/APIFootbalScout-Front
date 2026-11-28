import type { Row } from '../../../components/RowList/RowList'
import type { ShortlistResponse } from '../../../interfaces/shortlist'
import { formatCost, targetsLabel } from '../../../utils/shortlists'

export const HOME_LIMIT = 5

const NO_TARGETS = 'Sem alvos'

export interface HomeShortlistRow extends Row {
  shortlistId: string
}

export interface HomeShortlistsView {
  rows: HomeShortlistRow[]
  hasMore: boolean
}

const toRow = (shortlist: ShortlistResponse): HomeShortlistRow => ({
  id: shortlist.shortlistId,
  shortlistId: shortlist.shortlistId,
  title: shortlist.nome,
  detail: `${targetsLabel(shortlist)} · ${shortlist.custoTotal ? formatCost(shortlist.custoTotal) : NO_TARGETS}`,
})

export const homeShortlists = (shortlists: ShortlistResponse[]): HomeShortlistsView => ({
  rows: shortlists.slice(0, HOME_LIMIT).map(toRow),
  hasMore: shortlists.length > HOME_LIMIT,
})
