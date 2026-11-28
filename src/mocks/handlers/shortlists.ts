import { HttpResponse, delay } from 'msw'
import { SHORTLIST_IDS, moreThanFiveShortlists } from '../fixtures/shortlists'
import { http } from '../http'
import { problem } from '../responses'
import {
  addTarget,
  createShortlist,
  findShortlist,
  listShortlists,
  moveTarget,
  removeTarget,
  type ShortlistOutcome,
} from '../shortlistStore'

export const SHORTLIST_LIST = '/api/Shortlist'
export const SHORTLIST_ITEM = '/api/Shortlist/{shortlistId}'
export const SHORTLIST_TARGETS = '/api/Shortlist/{shortlistId}/alvos'
export const SHORTLIST_TARGET = '/api/Shortlist/{shortlistId}/alvos/{jogadorId}'

export const ALWAYS_CONFLICT_SHORTLISTS = new Set<string>([SHORTLIST_IDS.conflito])

export const shortlistOutcomeResponse = (outcome: ShortlistOutcome, instance: string, status: 200 | 201 = 200) =>
  outcome.ok
    ? HttpResponse.json(outcome.shortlist, { status, headers: { ETag: `"${outcome.shortlist.version}"` } })
    : problem(outcome.status, outcome.code, instance)

export const shortlistsResponse = () => HttpResponse.json(listShortlists())

export const shortlistItemResponse = (shortlistId: string) => {
  const shortlist = findShortlist(shortlistId)
  return shortlist
    ? HttpResponse.json(shortlist, { headers: { ETag: `"${shortlist.version}"` } })
    : problem(404, 'shortlist.nao_encontrada', `GET /api/Shortlist/${shortlistId}`)
}

const conflict = (instance: string) => problem(412, 'shortlist.alterada_por_outra_requisicao', instance)

export const createShortlistResponse = async (request: Request) => {
  const { nome } = (await request.json()) as { nome: string }
  return shortlistOutcomeResponse(createShortlist(nome), 'POST /api/Shortlist', 201)
}

export const addTargetResponse = async (shortlistId: string, request: Request) => {
  const instance = `POST /api/Shortlist/${shortlistId}/alvos`
  if (ALWAYS_CONFLICT_SHORTLISTS.has(shortlistId)) return conflict(instance)
  const body = (await request.json()) as Parameters<typeof addTarget>[2]
  return shortlistOutcomeResponse(addTarget(shortlistId, request.headers.get('If-Match'), body), instance, 201)
}

export const moveTargetResponse = async (shortlistId: string, jogadorId: string, request: Request) => {
  const instance = `PUT /api/Shortlist/${shortlistId}/alvos/${jogadorId}`
  if (ALWAYS_CONFLICT_SHORTLISTS.has(shortlistId)) return conflict(instance)
  const { prioridade } = (await request.json()) as { prioridade?: number }
  return shortlistOutcomeResponse(
    moveTarget(shortlistId, Number(jogadorId), request.headers.get('If-Match'), prioridade ?? 0),
    instance,
  )
}

export const removeTargetResponse = (shortlistId: string, jogadorId: string, request: Request) => {
  const instance = `DELETE /api/Shortlist/${shortlistId}/alvos/${jogadorId}`
  if (ALWAYS_CONFLICT_SHORTLISTS.has(shortlistId)) return conflict(instance)
  return shortlistOutcomeResponse(removeTarget(shortlistId, Number(jogadorId), request.headers.get('If-Match')), instance)
}

export const shortlistsList = http.get(SHORTLIST_LIST, ({ response }) => response.untyped(shortlistsResponse()))

export const shortlistsEmpty = http.get(SHORTLIST_LIST, ({ response }) => response(200).json([]))

export const shortlistsUnknownError = http.get(SHORTLIST_LIST, ({ response }) =>
  response.untyped(problem(500, undefined, 'GET /api/Shortlist')),
)

export const shortlistsMoreThanFive = http.get(SHORTLIST_LIST, ({ response }) =>
  response(200).json(moreThanFiveShortlists()),
)

export const shortlistsSourceDown = http.get(SHORTLIST_LIST, ({ response }) =>
  response.untyped(problem(502, undefined, 'GET /api/Shortlist')),
)

export const shortlistsPending = http.get(SHORTLIST_LIST, async ({ response }) => {
  await delay('infinite')
  return response(200).json([])
})

export const shortlistFound = http.get(SHORTLIST_ITEM, ({ params, response }) =>
  response.untyped(shortlistItemResponse(params.shortlistId)),
)

export const shortlistNotFound = http.get(SHORTLIST_ITEM, ({ params, response }) =>
  response.untyped(problem(404, 'shortlist.nao_encontrada', `GET /api/Shortlist/${params.shortlistId}`)),
)

export const shortlistUnknownError = http.get(SHORTLIST_ITEM, ({ params, response }) =>
  response.untyped(problem(500, undefined, `GET /api/Shortlist/${params.shortlistId}`)),
)

export const shortlistPending = http.get(SHORTLIST_ITEM, async ({ params, response }) => {
  await delay('infinite')
  return response.untyped(shortlistItemResponse(params.shortlistId))
})

export const createShortlistHandler = http.post(SHORTLIST_LIST, async ({ request, response }) =>
  response.untyped(await createShortlistResponse(request)),
)

export const createShortlistUnknownError = http.post(SHORTLIST_LIST, ({ response }) =>
  response.untyped(problem(500, undefined, 'POST /api/Shortlist')),
)

export const createShortlistPending = http.post(SHORTLIST_LIST, async ({ request, response }) => {
  await delay('infinite')
  return response.untyped(await createShortlistResponse(request))
})

export const addTargetHandler = http.post(SHORTLIST_TARGETS, async ({ params, request, response }) =>
  response.untyped(await addTargetResponse(params.shortlistId, request)),
)

export const moveTargetHandler = http.put(SHORTLIST_TARGET, async ({ params, request, response }) =>
  response.untyped(await moveTargetResponse(params.shortlistId, params.jogadorId, request)),
)

export const removeTargetHandler = http.delete(SHORTLIST_TARGET, ({ params, request, response }) =>
  response.untyped(removeTargetResponse(params.shortlistId, params.jogadorId, request)),
)

const addRefusal = (status: number, code?: string) =>
  http.post(SHORTLIST_TARGETS, ({ params, response }) =>
    response.untyped(problem(status, code, `POST /api/Shortlist/${params.shortlistId}/alvos`)),
  )

export const addTargetConflict = addRefusal(412, 'shortlist.alterada_por_outra_requisicao')
export const addTargetDuplicate = addRefusal(422, 'shortlist.jogador_ja_na_lista')
export const addTargetLimit = addRefusal(422, 'shortlist.limite_de_alvos_atingido')
export const addTargetCurrency = addRefusal(422, 'shortlist.moeda_divergente')
export const addTargetUnknownError = addRefusal(500)

const moveRefusal = (status: number, code?: string) =>
  http.put(SHORTLIST_TARGET, ({ params, response }) =>
    response.untyped(problem(status, code, `PUT /api/Shortlist/${params.shortlistId}/alvos/${params.jogadorId}`)),
  )

export const moveTargetConflict = moveRefusal(412, 'shortlist.alterada_por_outra_requisicao')
export const moveTargetOutOfOrder = moveRefusal(422, 'shortlist.prioridade_fora_da_ordem')
export const moveTargetUnknownError = moveRefusal(500)

export const removeTargetNotFound = http.delete(SHORTLIST_TARGET, ({ params, response }) =>
  response.untyped(
    problem(404, 'shortlist.alvo_nao_encontrado', `DELETE /api/Shortlist/${params.shortlistId}/alvos/${params.jogadorId}`),
  ),
)

const hold = async () => {
  await delay('infinite')
  return new HttpResponse(null, { status: 204 })
}

export const writePending = [
  http.post(SHORTLIST_TARGETS, async ({ response }) => response.untyped(await hold())),
  http.put(SHORTLIST_TARGET, async ({ response }) => response.untyped(await hold())),
  http.delete(SHORTLIST_TARGET, async ({ response }) => response.untyped(await hold())),
]
