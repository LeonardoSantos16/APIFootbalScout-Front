import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsQuery, runAfterCreation, writeReport, type WriteInput } from './reportQueries'

export const useSaveReport = (playerId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: WriteInput) =>
      runAfterCreation((onCreated) => writeReport(queryClient, playerId, input, onCreated)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: reportsQuery(playerId).queryKey }),
  })
}
