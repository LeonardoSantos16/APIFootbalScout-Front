import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReportResponse } from '../interfaces/report'
import { reportQuery, reportsQuery } from './reportQueries'

const PLACEHOLDER_ID = 'novo'

export const useReport = (playerId: number, reportId: string | undefined) => {
  const queryClient = useQueryClient()
  const listKey = reportsQuery(playerId).queryKey

  return useQuery({
    ...reportQuery(reportId ?? PLACEHOLDER_ID),
    enabled: reportId !== undefined,
    initialData: () =>
      reportId === undefined
        ? undefined
        : queryClient.getQueryData<ReportResponse[]>(listKey)?.find((report) => report.relatorioId === reportId),
    initialDataUpdatedAt: () => queryClient.getQueryState(listKey)?.dataUpdatedAt,
  })
}
