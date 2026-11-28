import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ShortlistResponse } from '../interfaces/shortlist'
import { shortlistsQuery } from '../../../hooks/useShortlists'
import { shortlistQuery } from './shortlistQueries'

export const useShortlist = (shortlistId: string) => {
  const queryClient = useQueryClient()
  const listKey = shortlistsQuery().queryKey

  return useQuery({
    ...shortlistQuery(shortlistId),
    initialData: () =>
      queryClient.getQueryData<ShortlistResponse[]>(listKey)?.find((shortlist) => shortlist.shortlistId === shortlistId),
    initialDataUpdatedAt: () => queryClient.getQueryState(listKey)?.dataUpdatedAt,
  })
}
