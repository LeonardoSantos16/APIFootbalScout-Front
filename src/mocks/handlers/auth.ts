import { HttpResponse, delay } from 'msw'
import {
  changePassword,
  createScout,
  deleteScout,
  findScout,
  issueSession,
  redeemRefreshToken,
  releaseRefreshToken,
  revokeAll,
  scoutForAccessToken,
} from '../authStore'
import { http } from '../http'
import { problem } from '../responses'

const unauthorized = () => problem(401, undefined, 'GET /api')

interface AuthorizedArgs<Untyped> {
  request: Request
  response: { untyped: (response: Response) => Untyped }
}

export const withAuth =
  <Untyped, Args extends AuthorizedArgs<Untyped>, Result>(resolver: (args: Args) => Result) =>
  (args: Args): Result | Untyped =>
    scoutForAccessToken(args.request.headers.get('Authorization'))
      ? resolver(args)
      : args.response.untyped(unauthorized())

const signUp = http.post('/api/Auth/signup', async ({ request, response }) => {
  const { name, email, password } = await request.json()
  if (findScout(email)) {
    return response.untyped(problem(409, 'usuario.email_ja_cadastrado', 'POST /api/Auth/signup'))
  }
  return response(201).json(issueSession(createScout(name, email, password)))
})

const signIn = http.post('/api/Auth/signin', async ({ request, response }) => {
  const { email, password } = await request.json()
  const scout = findScout(email)
  if (!scout || scout.password !== password) {
    return response.untyped(problem(401, 'usuario.credenciais_invalidas', 'POST /api/Auth/signin'))
  }
  return response(200).json(issueSession(scout))
})

const refresh = http.post('/api/Auth/refresh', async ({ request, response }) => {
  const { refreshToken } = await request.json()
  const scout = redeemRefreshToken(refreshToken)
  if (!scout) return response.untyped(problem(401, 'usuario.refresh_token_invalido', 'POST /api/Auth/refresh'))
  return response(200).json(issueSession(scout))
})

const signOut = http.post('/api/Auth/signout', async ({ request, response }) => {
  if (!scoutForAccessToken(request.headers.get('Authorization'))) return response.untyped(unauthorized())
  const { refreshToken } = await request.json()
  releaseRefreshToken(refreshToken)
  return response(204).empty()
})

const signOutAll = http.post('/api/Auth/signout-all', ({ request, response }) => {
  const scout = scoutForAccessToken(request.headers.get('Authorization'))
  if (!scout) return response.untyped(unauthorized())
  revokeAll(scout)
  return response(204).empty()
})

const changePasswordHandler = http.post('/api/Auth/change-password', async ({ request, response }) => {
  const scout = scoutForAccessToken(request.headers.get('Authorization'))
  if (!scout) return response.untyped(unauthorized())
  const { currentPassword, newPassword } = await request.json()
  if (currentPassword !== scout.password) {
    return response.untyped(problem(400, 'usuario.senha_atual_invalida', 'POST /api/Auth/change-password'))
  }
  if (newPassword === scout.password) {
    return response.untyped(problem(422, 'usuario.senha_igual_a_atual', 'POST /api/Auth/change-password'))
  }
  changePassword(scout, newPassword)
  return response(200).json(issueSession(scout))
})

const me = http.get('/api/Auth/me', ({ request, response }) => {
  const scout = scoutForAccessToken(request.headers.get('Authorization'))
  if (!scout) return response.untyped(unauthorized())
  return response(200).json({ userId: scout.userId, email: scout.email, roles: [] })
})

const deleteMe = http.delete('/api/Auth/me', ({ request, response }) => {
  const scout = scoutForAccessToken(request.headers.get('Authorization'))
  if (!scout) return response.untyped(unauthorized())
  deleteScout(scout)
  return response(204).empty()
})

export const authHandlers = [signUp, signIn, refresh, signOut, signOutAll, changePasswordHandler, me, deleteMe]

export const signInWrongCredentials = http.post('/api/Auth/signin', ({ response }) =>
  response.untyped(problem(401, 'usuario.credenciais_invalidas', 'POST /api/Auth/signin')),
)

export const signUpEmailTaken = http.post('/api/Auth/signup', ({ response }) =>
  response.untyped(problem(409, 'usuario.email_ja_cadastrado', 'POST /api/Auth/signup')),
)

export const signInPending = http.post('/api/Auth/signin', async () => {
  await delay('infinite')
  return HttpResponse.error()
})

export const signUpPending = http.post('/api/Auth/signup', async () => {
  await delay('infinite')
  return HttpResponse.error()
})

export const signInUnknownError = http.post('/api/Auth/signin', ({ response }) =>
  response.untyped(problem(500, undefined, 'POST /api/Auth/signin')),
)

export const refreshRefused = http.post('/api/Auth/refresh', ({ response }) =>
  response.untyped(problem(401, 'usuario.refresh_token_invalido', 'POST /api/Auth/refresh')),
)

export const refreshWithoutIdentification = http.post('/api/Auth/refresh', ({ response }) =>
  response.untyped(problem(401, 'usuario.token_sem_identificacao', 'POST /api/Auth/refresh')),
)

export const refreshUnavailable = http.post('/api/Auth/refresh', ({ response }) =>
  response.untyped(problem(502, undefined, 'POST /api/Auth/refresh')),
)

export const mePending = http.get('/api/Auth/me', async () => {
  await delay('infinite')
  return HttpResponse.error()
})

export const meUnauthorized = http.get('/api/Auth/me', ({ response }) => response.untyped(unauthorized()))

export const changePasswordWrongCurrent = http.post('/api/Auth/change-password', ({ response }) =>
  response.untyped(problem(400, 'usuario.senha_atual_invalida', 'POST /api/Auth/change-password')),
)

export const changePasswordSameAsCurrent = http.post('/api/Auth/change-password', ({ response }) =>
  response.untyped(problem(422, 'usuario.senha_igual_a_atual', 'POST /api/Auth/change-password')),
)

export const changePasswordPending = http.post('/api/Auth/change-password', async () => {
  await delay('infinite')
  return HttpResponse.error()
})

export const signOutFailing = [
  http.post('/api/Auth/signout', () => HttpResponse.error()),
  http.post('/api/Auth/signout-all', () => HttpResponse.error()),
]
