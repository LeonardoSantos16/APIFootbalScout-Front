import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchClient } from '../../../api/client'
import type { Slice } from '../../../interfaces/slice'
import { isAlreadyTracked } from '../utils/trackingError'
import { trackingQueryKey } from './useTracking'

export const useOpenTracking = (playerId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (slice: Slice) => {
      try {
        await fetchClient.POST('/api/Acompanhamento', {
          body: {
            jogadorId: playerId,
            competicaoId: slice.competitionId,
            temporadaId: slice.seasonId,
            contexto: slice.context,
          },
        })
      } catch (error) {
        if (!isAlreadyTracked(error)) throw error
      }
      await queryClient.invalidateQueries({ queryKey: trackingQueryKey(playerId) })
    },
  })
}
