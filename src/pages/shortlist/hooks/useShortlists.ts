import { useQuery } from '@tanstack/react-query'
import { sortByName } from '../utils/shortlists'
import { shortlistsQuery } from './shortlistQueries'

export const useShortlists = ({ fresh = false }: { fresh?: boolean } = {}) =>
  useQuery({
    ...shortlistsQuery(),
    select: sortByName,
    ...(fresh ? { staleTime: 0, refetchOnMount: 'always' as const } : {}),
  })
