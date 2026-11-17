import type { RequestHandler } from 'msw'
import type { components } from '../api/schema'
import type { PlayerProfile } from '../interfaces/player'
import { calculatedAttributes, insufficientSampleAttributes, metricsResponse } from './fixtures/metrics'
import {
  COPA_DO_BRASIL,
  buildFullProfile,
  buildNationalTeamOnlyProfile,
  buildProfileWithoutStats,
} from './fixtures/profiles'
import { authHandlers, withAuth } from './handlers/auth'
import { http } from './http'
import { plainText, problem } from './responses'

type Contexto = components['schemas']['ContextoDeRecorteDto']

const PROFILES: Record<number, (id: number) => PlayerProfile> = {
  1001: (id) => buildFullProfile(id),
  1002: (id) => buildNationalTeamOnlyProfile(id),
  1003: (id) => buildProfileWithoutStats(id),
  1005: (id) => buildFullProfile(id, 'Bruno Lacerda'),
}

const METRICS_SOURCE_DOWN = new Set([1005])

const profileById = http.get(
  '/api/Players/{id}/profile',
  withAuth(({ params, response }) => {
    const id = Number(params.id)
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

export const handlers: RequestHandler[] = [...authHandlers, profileById, metricsById]
