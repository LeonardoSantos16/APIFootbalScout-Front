import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClient } from '../../../api/client'
import type { ShortlistResponse } from '../interfaces/shortlist'
import { isShortlistConflict } from '../utils/shortlistError'
import { shortlistsQuery } from '../../../hooks/useShortlists'
import { ifMatch, invalidateShortlists, rememberShortlist, required } from './shortlistQueries'

export interface AddTargetInput {
  shortlist: ShortlistResponse
  playerId: number
  priority: number
  cents: number
  currency: string
}

export const useAddTarget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ shortlist, playerId, priority, cents, currency }: AddTargetInput) => {
      const { data } = await fetchClient.POST('/api/Shortlist/{shortlistId}/alvos', {
        params: { path: { shortlistId: shortlist.shortlistId }, header: { 'If-Match': ifMatch(shortlist.version) } },
        body: { jogadorId: playerId, prioridade: priority, custoEstimado: { quantiaEmCentavos: cents, moeda: currency } },
      })
      return rememberShortlist(queryClient, required(data))
    },
    onSuccess: () => invalidateShortlists(queryClient),
    onError: async (error) => {
      if (isShortlistConflict(error)) await queryClient.refetchQueries({ queryKey: shortlistsQuery().queryKey })
    },
  })
}
