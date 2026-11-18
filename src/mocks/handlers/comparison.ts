import { delay } from 'msw'
import { realizedComparison, refusedComparison } from '../fixtures/comparison'
import { http } from '../http'
import { problem } from '../responses'

const COMPARISON = '/api/Analise/comparacao'
const INSTANCE = 'GET /api/Analise/comparacao'

interface PairQuery {
  get: (name: 'JogadorA' | 'JogadorB') => string | null
}

const pair = (query: PairQuery) => ({
  pageId: Number(query.get('JogadorA') ?? 1001),
  otherId: Number(query.get('JogadorB') ?? 1006),
})

export const comparisonRealizada = http.get(COMPARISON, ({ query, response }) => {
  const { pageId, otherId } = pair(query)
  return response(200).json(realizedComparison(pageId, otherId))
})

export const comparisonOneSideRefused = http.get(COMPARISON, ({ query, response }) =>
  response(200).json(realizedComparison(pair(query).pageId, 1005)),
)

export const comparisonIncompatiblePositions = http.get(COMPARISON, ({ query, response }) =>
  response(200).json(refusedComparison('PosicoesIncompativeis', pair(query).pageId, 1004)),
)

export const comparisonUnknownPosition = http.get(COMPARISON, ({ query, response }) =>
  response(200).json(refusedComparison('PosicaoDesconhecida', pair(query).pageId, 1007)),
)

export const comparisonInsufficientSample = http.get(COMPARISON, ({ query, response }) =>
  response(200).json(refusedComparison('AmostraInsuficiente', pair(query).pageId, 1003)),
)

export const comparisonDivergentRecorte = http.get(COMPARISON, ({ query, response }) =>
  response(200).json(refusedComparison('RecorteDivergente', pair(query).pageId, 1006)),
)

export const comparisonStatisticsNotFound = http.get(COMPARISON, ({ response }) =>
  response.untyped(problem(404, 'jogador.estatisticas_nao_encontradas', INSTANCE)),
)

export const comparisonPlayerNotFound = http.get(COMPARISON, ({ response }) =>
  response.untyped(problem(404, 'jogador.perfil_nao_encontrado', INSTANCE)),
)

export const comparisonSamePlayer = http.get(COMPARISON, ({ response }) =>
  response.untyped(problem(400, 'comparacao.jogador_consigo_mesmo', INSTANCE)),
)

export const comparisonSourceDown = http.get(COMPARISON, ({ response }) =>
  response.untyped(problem(502, 'sofascore.estatisticas_do_jogador_indisponiveis', INSTANCE)),
)

export const comparisonPending = http.get(COMPARISON, async ({ query, response }) => {
  await delay('infinite')
  const { pageId, otherId } = pair(query)
  return response(200).json(realizedComparison(pageId, otherId))
})
