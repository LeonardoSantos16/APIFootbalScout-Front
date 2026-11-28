import type { RequestHandler } from 'msw'
import type { components } from '../api/schema'
import type { PlayerProfile } from '../interfaces/player'
import { realizedComparison, refusedComparison } from './fixtures/comparison'
import { calculatedAttributes, insufficientSampleAttributes, metricsResponse } from './fixtures/metrics'
import {
  COPA_DO_BRASIL,
  buildFullProfile,
  buildManyRecortesProfile,
  buildNationalTeamOnlyProfile,
  buildProfileWithoutStats,
  buildSparseProfile,
} from './fixtures/profiles'
import { searchPlayers } from './fixtures/search'
import {
  openedTrackingResult,
  trackingNoRelevantChangeResponse,
  trackingOpenedTodayResponse,
  trackingUnavailableResponse,
  trackingWithChangesResponse,
} from './fixtures/tracking'
import { authHandlers, withAuth } from './handlers/auth'
import {
  REPORT_CORRECT,
  REPORT_FINALIZE,
  REPORT_ITEM,
  REPORT_LIST,
  REPORT_OPEN,
  itemResponse,
  listResponse,
  outcomeResponse,
} from './handlers/reports'
import {
  addTargetResponse,
  createShortlistResponse,
  moveTargetResponse,
  removeTargetResponse,
  shortlistItemResponse,
  shortlistsResponse,
  SHORTLIST_ITEM,
  SHORTLIST_LIST,
  SHORTLIST_TARGET,
  SHORTLIST_TARGETS,
} from './handlers/shortlists'
import { PROFILE_SOURCE_DOWN_PLAYER } from './fixtures/shortlists'
import { http } from './http'
import { plainText, problem } from './responses'
import { correctReport, createReport, editReport, finalizeReport, findReport } from './reportStore'
import { isTracked, startTracking } from './trackingStore'

type Contexto = components['schemas']['ContextoDeRecorteDto']

const PROFILES: Record<number, (id: number) => PlayerProfile> = {
  1001: (id) => buildFullProfile(id),
  1002: (id) => buildNationalTeamOnlyProfile(id),
  1003: (id) => buildProfileWithoutStats(id),
  1005: (id) => buildFullProfile(id, 'Bruno Lacerda'),
  1006: (id) => buildManyRecortesProfile(id),
  1007: (id) => buildSparseProfile(id),
  1008: (id) => buildFullProfile(id, 'Tiago Ferraz'),
}

const METRICS_SOURCE_DOWN = new Set([1005])

const profileById = http.get(
  '/api/Players/{id}/profile',
  withAuth(({ params, response }) => {
    const id = Number(params.id)
    if (id === PROFILE_SOURCE_DOWN_PLAYER) {
      return response.untyped(problem(502, 'sofascore.perfil_do_jogador_indisponivel', `GET /api/Players/${id}/profile`))
    }
    const build = PROFILES[id]
    return build
      ? response(200).json(build(id))
      : response.untyped(plainText(404, `Player with ID ${id} not found`))
  }),
)

const metricsById = http.get(
  '/api/Analise/{jogadorId}/metricas-por-90',
  withAuth(({ params, query, response }) => {
    const jogadorId = Number(params.jogadorId)
    const instance = `GET /api/Analise/${jogadorId}/metricas-por-90`

    if (METRICS_SOURCE_DOWN.has(jogadorId)) {
      return response.untyped(problem(502, 'sofascore.estatisticas_do_jogador_indisponiveis', instance))
    }

    const competicaoId = Number(query.get('CompeticaoId'))
    const attributes = competicaoId === COPA_DO_BRASIL.id ? insufficientSampleAttributes : calculatedAttributes

    return response(200).json(
      metricsResponse(attributes, jogadorId, {
        competicaoId,
        temporadaId: Number(query.get('TemporadaId')),
        contexto: (query.get('Contexto') ?? 'Clube') as Contexto,
      }),
    )
  }),
)

const SEARCH_SOURCE_DOWN_TERM = 'erro'
const SEARCH_EMPTY_TERM = 'vazio'

const searchByTerm = http.get(
  '/api/Players/search',
  withAuth(({ query, response }) => {
    const term = (query.get('q') ?? '').trim().toLowerCase()
    if (term === '') return response.untyped(plainText(400, 'Name is required'))
    if (term === SEARCH_SOURCE_DOWN_TERM) return response.untyped(plainText(502, 'Bad Gateway'))
    if (term === SEARCH_EMPTY_TERM) return response(200).json({ results: [] })
    return response(200).json(searchPlayers(term))
  }),
)

const COMPARISON_INSTANCE = 'GET /api/Analise/comparacao'

const comparisonByPair = http.get(
  '/api/Analise/comparacao',
  withAuth(({ query, response }) => {
    const pageId = Number(query.get('JogadorA'))
    const otherId = Number(query.get('JogadorB'))
    if (pageId === otherId) {
      return response.untyped(problem(400, 'comparacao.jogador_consigo_mesmo', COMPARISON_INSTANCE))
    }
    if (otherId === 1002) {
      return response.untyped(problem(404, 'jogador.estatisticas_nao_encontradas', COMPARISON_INSTANCE))
    }
    if (Number(query.get('CompeticaoId')) === COPA_DO_BRASIL.id || otherId === 1003) {
      return response(200).json(refusedComparison('AmostraInsuficiente', pageId, otherId))
    }
    if (otherId === 1004) return response(200).json(refusedComparison('PosicoesIncompativeis', pageId, otherId))
    if (otherId === 1007) return response(200).json(refusedComparison('PosicaoDesconhecida', pageId, otherId))
    return response(200).json(
      realizedComparison(pageId, otherId, {
        competicaoId: Number(query.get('CompeticaoId')),
        temporadaId: Number(query.get('TemporadaId')),
        contexto: (query.get('Contexto') ?? 'Clube') as Contexto,
      }),
    )
  }),
)

const TRACKING_READINGS: Record<number, (id: number) => components['schemas']['ConsultarMudancaAcompanhamentoResponseDto']> = {
  1001: trackingWithChangesResponse,
  1002: trackingNoRelevantChangeResponse,
  1003: trackingUnavailableResponse,
}

const TRACKING_SOURCE_DOWN = new Set([1007])
const TRACKING_LIMIT_REACHED = new Set([1005])
const TRACKING_INSUFFICIENT_INFORMATION = new Set([1006])
const OPENING_INSTANCE = 'POST /api/Acompanhamento'

const trackingById = http.get(
  '/api/Acompanhamento/{jogadorId}',
  withAuth(({ params, response }) => {
    const jogadorId = Number(params.jogadorId)
    const instance = `GET /api/Acompanhamento/${jogadorId}`
    if (TRACKING_SOURCE_DOWN.has(jogadorId)) {
      return response.untyped(problem(502, 'sofascore.perfil_do_jogador_indisponivel', instance))
    }
    if (!isTracked(jogadorId)) {
      return response.untyped(problem(404, 'acompanhamento.dossie_nao_encontrado', instance))
    }
    const build = TRACKING_READINGS[jogadorId] ?? trackingOpenedTodayResponse
    return response(200).json(build(jogadorId))
  }),
)

const openTracking = http.post(
  '/api/Acompanhamento',
  withAuth(async ({ request, response }) => {
    const { jogadorId = 0 } = await request.json()
    if (TRACKING_LIMIT_REACHED.has(jogadorId)) {
      return response.untyped(problem(422, 'acompanhamento.limite_atingido', OPENING_INSTANCE))
    }
    if (TRACKING_INSUFFICIENT_INFORMATION.has(jogadorId)) {
      return response.untyped(problem(422, 'jogador.informacoes_insuficientes', OPENING_INSTANCE))
    }
    if (isTracked(jogadorId)) {
      return response.untyped(problem(409, 'acompanhamento.jogador_ja_acompanhado', OPENING_INSTANCE))
    }
    startTracking(jogadorId)
    return response(201).json(openedTrackingResult())
  }),
)

const REPORTS_LIST_DOWN = new Set([1007])
const REPORTS_ALWAYS_CONFLICT = new Set([1005])

const reportsByPlayer = http.get(
  REPORT_LIST,
  withAuth(({ params, response }) => {
    const jogadorId = Number(params.jogadorId)
    if (REPORTS_LIST_DOWN.has(jogadorId)) {
      return response.untyped(problem(500, undefined, `GET /api/Relatorio/jogador/${jogadorId}`))
    }
    return response.untyped(listResponse(params.jogadorId))
  }),
)

const reportById = http.get(
  REPORT_ITEM,
  withAuth(({ params, response }) => response.untyped(itemResponse(params.relatorioId))),
)

const openReport = http.post(
  REPORT_OPEN,
  withAuth(async ({ request, response }) =>
    response.untyped(outcomeResponse(createReport(await request.json()), 'POST /api/Relatorio', 201)),
  ),
)

const editReportById = http.put(
  REPORT_ITEM,
  withAuth(async ({ params, request, response }) => {
    const instance = `PUT /api/Relatorio/${params.relatorioId}`
    const report = findReport(params.relatorioId)
    if (report && REPORTS_ALWAYS_CONFLICT.has(report.jogadorId)) {
      return response.untyped(problem(412, 'relatorio.alterado_por_outra_requisicao', instance))
    }
    const edit = await request.json()
    return response.untyped(outcomeResponse(editReport(params.relatorioId, request.headers.get('If-Match'), edit), instance))
  }),
)

const finalizeReportById = http.put(
  REPORT_FINALIZE,
  withAuth(({ params, request, response }) =>
    response.untyped(
      outcomeResponse(
        finalizeReport(params.relatorioId, request.headers.get('If-Match')),
        `PUT /api/Relatorio/${params.relatorioId}/finalizar`,
      ),
    ),
  ),
)

const correctReportById = http.post(
  REPORT_CORRECT,
  withAuth(async ({ params, request, response }) => {
    const { texto } = await request.json()
    return response.untyped(
      outcomeResponse(correctReport(params.relatorioId, texto), `POST /api/Relatorio/${params.relatorioId}/correcoes`, 201),
    )
  }),
)

const shortlistsDefault = http.get(SHORTLIST_LIST, withAuth(({ response }) => response.untyped(shortlistsResponse())))

const createShortlistDefault = http.post(
  SHORTLIST_LIST,
  withAuth(async ({ request, response }) => response.untyped(await createShortlistResponse(request))),
)

const shortlistByIdDefault = http.get(
  SHORTLIST_ITEM,
  withAuth(({ params, response }) => response.untyped(shortlistItemResponse(params.shortlistId))),
)

const addTargetDefault = http.post(
  SHORTLIST_TARGETS,
  withAuth(async ({ params, request, response }) => response.untyped(await addTargetResponse(params.shortlistId, request))),
)

const moveTargetDefault = http.put(
  SHORTLIST_TARGET,
  withAuth(async ({ params, request, response }) =>
    response.untyped(await moveTargetResponse(params.shortlistId, params.jogadorId, request)),
  ),
)

const removeTargetDefault = http.delete(
  SHORTLIST_TARGET,
  withAuth(({ params, request, response }) =>
    response.untyped(removeTargetResponse(params.shortlistId, params.jogadorId, request)),
  ),
)

export const handlers: RequestHandler[] = [
  ...authHandlers,
  profileById,
  metricsById,
  searchByTerm,
  comparisonByPair,
  trackingById,
  openTracking,
  reportsByPlayer,
  reportById,
  openReport,
  editReportById,
  finalizeReportById,
  correctReportById,
  shortlistsDefault,
  createShortlistDefault,
  shortlistByIdDefault,
  addTargetDefault,
  moveTargetDefault,
  removeTargetDefault,
]
