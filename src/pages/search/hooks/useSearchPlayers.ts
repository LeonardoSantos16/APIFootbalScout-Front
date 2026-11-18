import { $api } from '../../../api/client'
import { isSearchableTerm } from '../../../utils/search'
import { playerResults } from '../utils/results'

const SEARCH_LIFETIME_MS = 5 * 60 * 1000

export const useSearchPlayers = (term: string | undefined) =>
  $api.useQuery(
    'get',
    '/api/Players/search',
    { params: { query: { q: term ?? '' } } },
    { enabled: isSearchableTerm(term), staleTime: SEARCH_LIFETIME_MS, select: playerResults },
  )
