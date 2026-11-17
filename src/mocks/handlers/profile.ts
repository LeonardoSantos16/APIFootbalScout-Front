import {
  buildFullProfile,
  buildNationalTeamOnlyProfile,
  buildProfileWithoutStats,
} from '../fixtures/profiles'
import { http } from '../http'
import { plainText, problem } from '../responses'

const PROFILE = '/api/Players/{id}/profile'

export const completeProfile = http.get(PROFILE, ({ params, response }) =>
  response(200).json(buildFullProfile(Number(params.id))),
)

export const nationalTeamOnlyProfile = http.get(PROFILE, ({ params, response }) =>
  response(200).json(buildNationalTeamOnlyProfile(Number(params.id))),
)

export const profileWithoutStats = http.get(PROFILE, ({ params, response }) =>
  response(200).json(buildProfileWithoutStats(Number(params.id))),
)

export const profileNotFound = http.get(PROFILE, ({ params, response }) =>
  response.untyped(plainText(404, `Player with ID ${params.id} not found`)),
)

export const profileSourceDown = http.get(PROFILE, ({ params, response }) =>
  response.untyped(
    problem(502, 'sofascore.perfil_do_jogador_indisponivel', `GET /api/Players/${params.id}/profile`),
  ),
)
