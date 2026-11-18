import type { components } from '../../api/schema'
import type { Attribute } from '../../interfaces/attribute'
import {
  calculatedAttributes,
  incompleteAttributes,
  insufficientSampleAttributes,
  metricsResponse,
} from '../fixtures/metrics'
import { http } from '../http'
import { problem } from '../responses'

const METRICS = '/api/Analise/{jogadorId}/metricas-por-90'

type Contexto = components['schemas']['ContextoDeRecorteDto']

const respondWith = (attributes: Attribute[]) =>
  http.get(METRICS, ({ params, query, response }) =>
    response(200).json(
      metricsResponse(attributes, Number(params.jogadorId), {
        competicaoId: Number(query.get('CompeticaoId')),
        temporadaId: Number(query.get('TemporadaId')),
        contexto: (query.get('Contexto') ?? 'Clube') as Contexto,
      }),
    ),
  )

export const calculatedMetrics = respondWith(calculatedAttributes)

export const insufficientSampleMetrics = respondWith(insufficientSampleAttributes)

export const incompleteMetrics = respondWith(incompleteAttributes)

export const metricsSourceDown = http.get(METRICS, ({ params, response }) =>
  response.untyped(
    problem(
      502,
      'sofascore.estatisticas_do_jogador_indisponiveis',
      `GET /api/Analise/${params.jogadorId}/metricas-por-90`,
    ),
  ),
)

export const metricsWithoutCode = http.get(METRICS, ({ params, response }) =>
  response.untyped(problem(500, undefined, `GET /api/Analise/${params.jogadorId}/metricas-por-90`)),
)
