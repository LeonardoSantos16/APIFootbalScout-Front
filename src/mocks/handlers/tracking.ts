import { delay } from 'msw'
import {
  openedTrackingResult,
  trackingMarketValueDownResponse,
  trackingNoRelevantChangeResponse,
  trackingOpenedTodayResponse,
  trackingUnavailableResponse,
  trackingWithChangesResponse,
} from '../fixtures/tracking'
import { http } from '../http'
import { problem } from '../responses'
import { startTracking } from '../trackingStore'

const READING = '/api/Acompanhamento/{jogadorId}'
const OPENING = '/api/Acompanhamento'
const OPENING_INSTANCE = 'POST /api/Acompanhamento'

const readingInstance = (jogadorId: string) => `GET /api/Acompanhamento/${jogadorId}`

export const trackingWithChanges = http.get(READING, ({ params, response }) =>
  response(200).json(trackingWithChangesResponse(Number(params.jogadorId))),
)

export const trackingMarketValueDown = http.get(READING, ({ params, response }) =>
  response(200).json(trackingMarketValueDownResponse(Number(params.jogadorId))),
)

export const trackingNoRelevantChange = http.get(READING, ({ params, response }) =>
  response(200).json(trackingNoRelevantChangeResponse(Number(params.jogadorId))),
)

export const trackingUnavailable = http.get(READING, ({ params, response }) =>
  response(200).json(trackingUnavailableResponse(Number(params.jogadorId))),
)

export const trackingOpenedToday = http.get(READING, ({ params, response }) =>
  response(200).json(trackingOpenedTodayResponse(Number(params.jogadorId))),
)

export const trackingNotTracked = http.get(READING, ({ params, response }) =>
  response.untyped(problem(404, 'acompanhamento.dossie_nao_encontrado', readingInstance(params.jogadorId))),
)

export const trackingSourceDown = http.get(READING, ({ params, response }) =>
  response.untyped(problem(502, 'sofascore.perfil_do_jogador_indisponivel', readingInstance(params.jogadorId))),
)

export const trackingUnknownError = http.get(READING, ({ params, response }) =>
  response.untyped(problem(500, undefined, readingInstance(params.jogadorId))),
)

export const trackingPending = http.get(READING, async ({ params, response }) => {
  await delay('infinite')
  return response(200).json(trackingWithChangesResponse(Number(params.jogadorId)))
})

export const openTracking = http.post(OPENING, async ({ request, response }) => {
  const { jogadorId } = await request.json()
  if (jogadorId) startTracking(jogadorId)
  return response(201).json(openedTrackingResult())
})

export const openTrackingAlreadyTracked = http.post(OPENING, ({ response }) =>
  response.untyped(problem(409, 'acompanhamento.jogador_ja_acompanhado', OPENING_INSTANCE)),
)

export const openTrackingLimitReached = http.post(OPENING, ({ response }) =>
  response.untyped(problem(422, 'acompanhamento.limite_atingido', OPENING_INSTANCE)),
)

export const openTrackingInsufficientInformation = http.post(OPENING, ({ response }) =>
  response.untyped(problem(422, 'jogador.informacoes_insuficientes', OPENING_INSTANCE)),
)

export const openTrackingSourceDown = http.post(OPENING, ({ response }) =>
  response.untyped(problem(502, 'sofascore.perfil_do_jogador_indisponivel', OPENING_INSTANCE)),
)

export const openTrackingPending = http.post(OPENING, async ({ response }) => {
  await delay('infinite')
  return response(201).json(openedTrackingResult())
})
