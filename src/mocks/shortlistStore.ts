import type { components } from '../api/schema'
import { SHORTLIST_LIMIT, anaShortlists, totalOf } from './fixtures/shortlists'

type Schemas = components['schemas']
type Shortlist = Schemas['ShortlistResponseDto']
type Target = Schemas['AlvoResponseDto']

export type ShortlistOutcome = { ok: true; shortlist: Shortlist } | { ok: false; status: number; code?: string }

const STRONG_ETAG = /^"(\d+)"$/

const seed = () => new Map(anaShortlists().map((shortlist) => [shortlist.shortlistId, shortlist]))

const state = { shortlists: seed() }

export const resetShortlistStore = () => {
  state.shortlists = seed()
}

const refuse = (status: number, code?: string): ShortlistOutcome =>
  code ? { ok: false, status, code } : { ok: false, status }

const NOT_FOUND = refuse(404, 'shortlist.nao_encontrada')

const expectedVersion = (ifMatch: string | null) => {
  const match = ifMatch ? STRONG_ETAG.exec(ifMatch.trim()) : null
  return match ? Number(match[1]) : undefined
}

const renumber = (alvos: Target[]): Target[] => alvos.map((alvo, index) => ({ ...alvo, prioridade: index + 1 }))

const store = (shortlist: Shortlist, alvos: Target[]): ShortlistOutcome => {
  const renumbered = renumber(alvos)
  const total = totalOf(renumbered)
  const next: Shortlist = {
    shortlistId: shortlist.shortlistId,
    nome: shortlist.nome,
    limiteDeAlvos: shortlist.limiteDeAlvos,
    alvos: renumbered,
    version: shortlist.version + 1,
    ...(total ? { custoTotal: total } : {}),
  }
  state.shortlists.set(next.shortlistId, next)
  return { ok: true, shortlist: next }
}

const guardWrite = (shortlistId: string, ifMatch: string | null): ShortlistOutcome => {
  const version = expectedVersion(ifMatch)
  if (version === undefined) return refuse(428)
  const shortlist = state.shortlists.get(shortlistId)
  if (!shortlist) return NOT_FOUND
  if (shortlist.version !== version) return refuse(412, 'shortlist.alterada_por_outra_requisicao')
  return { ok: true, shortlist }
}

export const listShortlists = (): Shortlist[] => [...state.shortlists.values()]

export const findShortlist = (shortlistId: string): Shortlist | undefined => state.shortlists.get(shortlistId)

export const createShortlist = (nome: string): ShortlistOutcome => {
  if (!nome) return refuse(400)
  const shortlist: Shortlist = {
    shortlistId: crypto.randomUUID(),
    nome,
    limiteDeAlvos: SHORTLIST_LIMIT,
    alvos: [],
    version: 1,
  }
  state.shortlists.set(shortlist.shortlistId, shortlist)
  return { ok: true, shortlist }
}

export const addTarget = (
  shortlistId: string,
  ifMatch: string | null,
  request: Schemas['AdicionarAlvoRequestDto'],
): ShortlistOutcome => {
  const guard = guardWrite(shortlistId, ifMatch)
  if (!guard.ok) return guard
  const { shortlist } = guard
  const jogadorId = request.jogadorId ?? 0
  const prioridade = request.prioridade ?? 0
  if (prioridade <= 0) return refuse(400, 'prioridade.nao_positiva')
  if (shortlist.alvos.some((alvo) => alvo.jogadorId === jogadorId)) return refuse(422, 'shortlist.jogador_ja_na_lista')
  const currency = shortlist.alvos[0]?.custoEstimado.moeda
  if (currency && currency !== request.custoEstimado.moeda) return refuse(422, 'shortlist.moeda_divergente')
  if (shortlist.alvos.length >= shortlist.limiteDeAlvos) return refuse(422, 'shortlist.limite_de_alvos_atingido')
  if (prioridade > shortlist.alvos.length + 1) return refuse(422, 'shortlist.prioridade_fora_da_ordem')
  const alvos = [...shortlist.alvos]
  alvos.splice(prioridade - 1, 0, { jogadorId, prioridade, custoEstimado: request.custoEstimado })
  return store(shortlist, alvos)
}

export const moveTarget = (
  shortlistId: string,
  jogadorId: number,
  ifMatch: string | null,
  prioridade: number,
): ShortlistOutcome => {
  const guard = guardWrite(shortlistId, ifMatch)
  if (!guard.ok) return guard
  const { shortlist } = guard
  if (prioridade <= 0) return refuse(400, 'prioridade.nao_positiva')
  const index = shortlist.alvos.findIndex((alvo) => alvo.jogadorId === jogadorId)
  if (index < 0) return refuse(404, 'shortlist.alvo_nao_encontrado')
  if (prioridade > shortlist.alvos.length) return refuse(422, 'shortlist.prioridade_fora_da_ordem')
  const alvos = [...shortlist.alvos]
  const [moved] = alvos.splice(index, 1)
  alvos.splice(prioridade - 1, 0, moved)
  return store(shortlist, alvos)
}

export const removeTarget = (shortlistId: string, jogadorId: number, ifMatch: string | null): ShortlistOutcome => {
  const guard = guardWrite(shortlistId, ifMatch)
  if (!guard.ok) return guard
  const { shortlist } = guard
  if (!shortlist.alvos.some((alvo) => alvo.jogadorId === jogadorId)) return refuse(404, 'shortlist.alvo_nao_encontrado')
  return store(
    shortlist,
    shortlist.alvos.filter((alvo) => alvo.jogadorId !== jogadorId),
  )
}
