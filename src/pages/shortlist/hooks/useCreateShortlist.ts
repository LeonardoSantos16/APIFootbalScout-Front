import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClient } from '../../../api/client'
import { invalidateShortlists, rememberShortlist, required } from './shortlistQueries'

export const useCreateShortlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await fetchClient.POST('/api/Shortlist', { body: { nome: name } })
      return rememberShortlist(queryClient, required(data))
    },
    onSuccess: () => invalidateShortlists(queryClient),
  })
}
