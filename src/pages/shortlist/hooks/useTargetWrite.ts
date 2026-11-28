import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClient } from '../../../api/client'
import type { ShortlistResponse, TargetWrite } from '../interfaces/shortlist'
import { isShortlistConflict } from '../utils/shortlistError'
import { ifMatch, invalidateShortlists, rememberShortlist, required, shortlistQuery } from './shortlistQueries'

const send = async (shortlist: ShortlistResponse, write: TargetWrite) => {
  const path = { shortlistId: shortlist.shortlistId, jogadorId: write.playerId }
  const header = { 'If-Match': ifMatch(shortlist.version) }
  if (write.kind === 'move') {
    const { data } = await fetchClient.PUT('/api/Shortlist/{shortlistId}/alvos/{jogadorId}', {
      params: { path, header },
      body: { prioridade: write.priority },
    })
    return required(data)
  }
  const { data } = await fetchClient.DELETE('/api/Shortlist/{shortlistId}/alvos/{jogadorId}', { params: { path, header } })
  return required(data)
}

export const useTargetWrite = (shortlistId: string) => {
  const queryClient = useQueryClient()
  const queryKey = shortlistQuery(shortlistId).queryKey

  return useMutation({
    mutationFn: async (write: TargetWrite) => {
      const current = required(queryClient.getQueryData<ShortlistResponse>(queryKey))
      return rememberShortlist(queryClient, await send(current, write))
    },
    onError: async (error) => {
      if (isShortlistConflict(error)) await queryClient.refetchQueries({ queryKey })
    },
    onSettled: () => invalidateShortlists(queryClient),
  })
}
