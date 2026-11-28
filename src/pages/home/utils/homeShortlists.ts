import type { Row } from '../../../components/RowList/RowList'
import type { ShortlistResponse } from '../../../interfaces/shortlist'

export const HOME_LIMIT = 5

export interface HomeShortlistRow extends Row {
  shortlistId: string
}

export interface HomeShortlistsView {
  rows: HomeShortlistRow[]
  hasMore: boolean
}

export const homeShortlists = (shortlists: ShortlistResponse[]): HomeShortlistsView => ({
  rows: shortlists.map((shortlist) => ({ id: shortlist.shortlistId, shortlistId: shortlist.shortlistId, title: shortlist.nome })),
  hasMore: false,
})
