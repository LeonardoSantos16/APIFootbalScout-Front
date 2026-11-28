import { useQuery } from '@tanstack/react-query'
import { $api } from '../api/client'
import { sortByName } from '../utils/shortlists'

export const SHORTLIST_LIFETIME_MS = 60 * 1000

export const shortlistsQuery = () => ({
  ...$api.queryOptions('get', '/api/Shortlist'),
  staleTime: SHORTLIST_LIFETIME_MS,
})

export const useShortlists = ({ fresh = false }: { fresh?: boolean } = {}) =>
  useQuery({
    ...shortlistsQuery(),
    select: sortByName,
    ...(fresh ? { staleTime: 0, refetchOnMount: 'always' as const } : {}),
  })
