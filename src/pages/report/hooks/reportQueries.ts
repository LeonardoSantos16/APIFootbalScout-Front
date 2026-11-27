import type { QueryClient } from '@tanstack/react-query'
import { $api, ApiError, fetchClient } from '../../../api/client'
import type { ReportForm, ReportResponse } from '../interfaces/report'
import { observationToApi } from '../utils/reportDates'
import { editPayload } from '../utils/reportForm'

const REPORT_LIFETIME_MS = 60 * 1000

export const reportsQuery = (playerId: number) => ({
  ...$api.queryOptions('get', '/api/Relatorio/jogador/{jogadorId}', { params: { path: { jogadorId: playerId } } }),
  staleTime: REPORT_LIFETIME_MS,
})

export const reportQuery = (reportId: string) => ({
  ...$api.queryOptions('get', '/api/Relatorio/{relatorioId}', { params: { path: { relatorioId: reportId } } }),
  staleTime: REPORT_LIFETIME_MS,
})

export interface WriteInput {
  saved?: ReportResponse
  form: ReportForm
  correctionOf?: string
}

export type CreatedHandler = (report: ReportResponse) => void

export class CreatedButNotCompletedError extends Error {
  readonly created: ReportResponse
  readonly reason: unknown

  constructor(created: ReportResponse, reason: unknown) {
    super('Relatório criado, mas a gravação seguinte falhou')
    this.name = 'CreatedButNotCompletedError'
    this.created = created
    this.reason = reason
  }
}

export const runAfterCreation = async <T>(task: (onCreated: CreatedHandler) => Promise<T>): Promise<T> => {
  let created: ReportResponse | undefined
  try {
    return await task((report) => {
      created = report
    })
  } catch (error) {
    if (created) throw new CreatedButNotCompletedError(created, error)
    throw error
  }
}

const ifMatch = (version: number) => `"${version}"`

const required = <T>(data: T | undefined): T => {
  if (data === undefined) throw new ApiError(500, undefined)
  return data
}

const remember = (queryClient: QueryClient, report: ReportResponse) => {
  queryClient.setQueryData(reportQuery(report.relatorioId).queryKey, report)
  return report
}

const create = async (playerId: number, { form, correctionOf }: WriteInput) => {
  if (correctionOf) {
    const { data } = await fetchClient.POST('/api/Relatorio/{relatorioId}/correcoes', {
      params: { path: { relatorioId: correctionOf } },
      body: { texto: form.narrative },
    })
    return required(data)
  }
  const { data } = await fetchClient.POST('/api/Relatorio', {
    body: { jogadorId: playerId, texto: form.narrative, observadoEm: observationToApi(form.observation) },
  })
  return required(data)
}

export const writeReport = async (
  queryClient: QueryClient,
  playerId: number,
  input: WriteInput,
  onCreated?: CreatedHandler,
): Promise<ReportResponse> => {
  let current = input.saved
  if (!current) {
    current = remember(queryClient, await create(playerId, input))
    onCreated?.(current)
  }
  const payload = editPayload(current, input.form)
  if (Object.keys(payload).length === 0) return current
  const { data } = await fetchClient.PUT('/api/Relatorio/{relatorioId}', {
    params: { path: { relatorioId: current.relatorioId }, header: { 'If-Match': ifMatch(current.version) } },
    body: payload,
  })
  return remember(queryClient, required(data))
}

export const finalize = async (queryClient: QueryClient, report: ReportResponse): Promise<ReportResponse> => {
  const { data } = await fetchClient.PUT('/api/Relatorio/{relatorioId}/finalizar', {
    params: { path: { relatorioId: report.relatorioId }, header: { 'If-Match': ifMatch(report.version) } },
  })
  return remember(queryClient, required(data))
}
