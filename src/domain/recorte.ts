import type { components } from '../api/schema'

type Schemas = components['schemas']

type Contexto = Schemas['ContextoDeRecorteDto']

export type Perfil = Schemas['PlayerFullProfileDto']

export type Recorte = {
  competicaoId: number
  temporadaId: number
  contexto: Contexto
  competicao: string
  temporada: string
  minutosJogados: number
}

const NOME_DO_CONTEXTO: Record<Contexto, string> = {
  Clube: 'Clube',
  Selecao: 'Seleção',
}

const CONTEXTOS = Object.keys(NOME_DO_CONTEXTO) as Contexto[]

const SEPARADOR = ' · '

const daMaisRecente = (a: Recorte, b: Recorte) =>
  b.temporadaId - a.temporadaId || b.minutosJogados - a.minutosJogados

export const derivarRecortes = (perfil: Perfil): Recorte[] => {
  const selecoes = new Set((perfil.nationalTeamStats ?? []).map((item) => item.team.id))

  return (perfil.stats ?? [])
    .map(
      (item): Recorte => ({
        competicaoId: item.uniqueTournament.id,
        temporadaId: item.season.id,
        contexto: selecoes.has(item.team.id) ? 'Selecao' : 'Clube',
        competicao: item.uniqueTournament.name,
        temporada: item.year,
        minutosJogados: item.statistics.minutesPlayed,
      }),
    )
    .sort(daMaisRecente)
}

export type BuscaDoRecorte = {
  competicao?: number
  temporada?: number
  contexto?: Contexto
}

export const rotuloDoRecorte = (recorte: Recorte, lista: Recorte[]): string => {
  const partes = [recorte.competicao, recorte.temporada]
  const comContexto = lista.some((item) => item.contexto === 'Selecao')
  return (comContexto ? [NOME_DO_CONTEXTO[recorte.contexto], ...partes] : partes).join(SEPARADOR)
}

const inteiroPositivo = (valor: unknown): number | undefined =>
  typeof valor === 'number' && Number.isInteger(valor) && valor > 0 ? valor : undefined

const contexto = (valor: unknown): Contexto | undefined =>
  CONTEXTOS.find((item) => item === valor)

export const validarBuscaDoRecorte = (busca: Record<string, unknown>): BuscaDoRecorte => ({
  competicao: inteiroPositivo(busca.competicao),
  temporada: inteiroPositivo(busca.temporada),
  contexto: contexto(busca.contexto),
})

export const encontrarRecorte = (lista: Recorte[], busca: BuscaDoRecorte): Recorte | undefined =>
  lista.find(
    (item) =>
      item.competicaoId === busca.competicao &&
      item.temporadaId === busca.temporada &&
      item.contexto === busca.contexto,
  )

export const recorteParaBusca = (recorte: Recorte): Required<BuscaDoRecorte> => ({
  competicao: recorte.competicaoId,
  temporada: recorte.temporadaId,
  contexto: recorte.contexto,
})

export const recorteParaParams = (recorte: Recorte) => ({
  CompeticaoId: recorte.competicaoId,
  TemporadaId: recorte.temporadaId,
  Contexto: recorte.contexto,
})
