import type { RequestHandler } from 'msw'
import type { components } from '../api/schema'
import type { PlayerProfile } from '../interfaces/player'
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
import { authHandlers, withAuth } from './handlers/auth'
import { http } from './http'
import { plainText, problem } from './responses'

type Contexto = components['schemas']['ContextoDeRecorteDto']

const PROFILES: Record<number, (id: number) => PlayerProfile> = {
  1001: (id) => buildFullProfile(id),
  1002: (id) => buildNationalTeamOnlyProfile(id),
  1003: (id) => buildProfileWithoutStats(id),
  1005: (id) => buildFullProfile(id, 'Bruno Lacerda'),
  1006: (id) => buildManyRecortesProfile(id),
  1007: (id) => buildSparseProfile(id),
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

export const handlers: RequestHandler[] = [...authHandlers, profileById, metricsById, searchByTerm]
