import type { QueryClient } from '@tanstack/react-query'
import { $api, ApiError } from '../../../api/client'
import { SHORTLIST_LIFETIME_MS, shortlistsQuery } from '../../../hooks/useShortlists'
import type { ShortlistResponse } from '../interfaces/shortlist'

export const shortlistQuery = (shortlistId: string) => ({
  ...$api.queryOptions('get', '/api/Shortlist/{shortlistId}', { params: { path: { shortlistId } } }),
  staleTime: SHORTLIST_LIFETIME_MS,
})

export const ifMatch = (version: number) => `"${version}"`

export const required = <T>(data: T | undefined): T => {
  if (data === undefined) throw new ApiError(500, undefined)
  return data
}

export const rememberShortlist = (queryClient: QueryClient, shortlist: ShortlistResponse) => {
  queryClient.setQueryData(shortlistQuery(shortlist.shortlistId).queryKey, shortlist)
  return shortlist
}

export const invalidateShortlists = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: shortlistsQuery().queryKey })
