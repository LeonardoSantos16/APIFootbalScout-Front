import { HttpResponse, delay } from 'msw'
import { looseDraftReport } from '../fixtures/reports'
import { http } from '../http'
import { correctReport, createReport, editReport, finalizeReport, findReport, listReports, type ReportOutcome } from '../reportStore'
import { problem } from '../responses'

export const REPORT_LIST = '/api/Relatorio/jogador/{jogadorId}'
export const REPORT_ITEM = '/api/Relatorio/{relatorioId}'
export const REPORT_OPEN = '/api/Relatorio'
export const REPORT_FINALIZE = '/api/Relatorio/{relatorioId}/finalizar'
export const REPORT_CORRECT = '/api/Relatorio/{relatorioId}/correcoes'

export const outcomeResponse = (outcome: ReportOutcome, instance: string, status: 200 | 201 = 200) =>
  outcome.ok
    ? HttpResponse.json(outcome.report, { status, headers: { ETag: `"${outcome.report.version}"` } })
    : problem(outcome.status, outcome.code, instance)

export const listResponse = (jogadorId: string) => HttpResponse.json(listReports(Number(jogadorId)))

export const itemResponse = (relatorioId: string) => {
  const report = findReport(relatorioId)
  return report
    ? HttpResponse.json(report, { headers: { ETag: `"${report.version}"` } })
    : problem(404, 'relatorio.nao_encontrado', `GET /api/Relatorio/${relatorioId}`)
}

export const reportsList = http.get(REPORT_LIST, ({ params, response }) => response.untyped(listResponse(params.jogadorId)))

export const reportsEmpty = http.get(REPORT_LIST, ({ response }) => response(200).json([]))

export const reportsUnknownError = http.get(REPORT_LIST, ({ params, response }) =>
  response.untyped(problem(500, undefined, `GET /api/Relatorio/jogador/${params.jogadorId}`)),
)

export const reportsPending = http.get(REPORT_LIST, async ({ response }) => {
  await delay('infinite')
  return response(200).json([])
})

export const reportFound = http.get(REPORT_ITEM, ({ params, response }) => response.untyped(itemResponse(params.relatorioId)))

export const reportNotFound = http.get(REPORT_ITEM, ({ params, response }) =>
  response.untyped(problem(404, 'relatorio.nao_encontrado', `GET /api/Relatorio/${params.relatorioId}`)),
)

export const reportPending = http.get(REPORT_ITEM, async ({ params, response }) => {
  await delay('infinite')
  return response.untyped(itemResponse(params.relatorioId))
})

export const createReportHandler = http.post(REPORT_OPEN, async ({ request, response }) =>
  response.untyped(outcomeResponse(createReport(await request.json()), 'POST /api/Relatorio', 201)),
)

export const editReportHandler = http.put(REPORT_ITEM, async ({ params, request, response }) =>
  response.untyped(
    outcomeResponse(
      editReport(params.relatorioId, request.headers.get('If-Match'), await request.json()),
      `PUT /api/Relatorio/${params.relatorioId}`,
    ),
  ),
)

export const finalizeReportHandler = http.put(REPORT_FINALIZE, ({ params, request, response }) =>
  response.untyped(
    outcomeResponse(
      finalizeReport(params.relatorioId, request.headers.get('If-Match')),
      `PUT /api/Relatorio/${params.relatorioId}/finalizar`,
    ),
  ),
)

export const correctReportHandler = http.post(REPORT_CORRECT, async ({ params, request, response }) => {
  const { texto } = await request.json()
  return response.untyped(
    outcomeResponse(correctReport(params.relatorioId, texto), `POST /api/Relatorio/${params.relatorioId}/correcoes`, 201),
  )
})

export const editReportConflict = http.put(REPORT_ITEM, ({ params, response }) =>
  response.untyped(problem(412, 'relatorio.alterado_por_outra_requisicao', `PUT /api/Relatorio/${params.relatorioId}`)),
)

export const editReportAlreadyFinalized = http.put(REPORT_ITEM, ({ params, response }) =>
  response.untyped(problem(409, 'relatorio.ja_finalizado', `PUT /api/Relatorio/${params.relatorioId}`)),
)

export const editReportUnknownError = http.put(REPORT_ITEM, ({ params, response }) =>
  response.untyped(problem(500, undefined, `PUT /api/Relatorio/${params.relatorioId}`)),
)

export const finalizeReportMinimumContent = http.put(REPORT_FINALIZE, ({ params, response }) =>
  response.untyped(
    problem(422, 'relatorio.conteudo_minimo_nao_atendido', `PUT /api/Relatorio/${params.relatorioId}/finalizar`),
  ),
)

export const finalizeReportConclusionMissing = http.put(REPORT_FINALIZE, ({ params, response }) =>
  response.untyped(problem(422, 'relatorio.conclusao_ausente', `PUT /api/Relatorio/${params.relatorioId}/finalizar`)),
)

export const createReportFutureDate = http.post(REPORT_OPEN, ({ response }) =>
  response.untyped(problem(409, 'relatorio.observacao_futura', 'POST /api/Relatorio')),
)

export const editReportPending = http.put(REPORT_ITEM, async ({ params, response }) => {
  await delay('infinite')
  return response.untyped(itemResponse(params.relatorioId))
})

export const reportCompleteDraft = http.get(REPORT_ITEM, ({ params, response }) =>
  response(200).json({
    ...looseDraftReport(),
    relatorioId: params.relatorioId,
    pontosPositivos: ['Recebe de costas e gira rápido', 'Leitura entre as linhas'],
    pontosNegativos: ['Cai de produção depois dos 70', 'Evita a disputa aérea'],
  }),
)
