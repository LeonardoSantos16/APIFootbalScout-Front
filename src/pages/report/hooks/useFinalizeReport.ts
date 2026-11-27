import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isDirty } from '../utils/reportForm'
import { finalize, reportsQuery, runAfterCreation, writeReport, type WriteInput } from './reportQueries'

export const useFinalizeReport = (playerId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: WriteInput) =>
      runAfterCreation(async (onCreated) => {
        const saved =
          input.saved && !isDirty(input.saved, input.form)
            ? input.saved
            : await writeReport(queryClient, playerId, input, onCreated)
        return finalize(queryClient, saved)
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: reportsQuery(playerId).queryKey }),
  })
}
