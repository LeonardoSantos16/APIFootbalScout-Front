import type { components } from '../api/schema'

type Schemas = components['schemas']

export type Perfil = Schemas['PlayerFullProfileDto']

export type Recorte = {
  competicaoId: number
  temporadaId: number
  contexto: Schemas['ContextoDeRecorteDto']
  competicao: string
  temporada: string
  minutosJogados: number
}

export const derivarRecortes = (_perfil: Perfil): Recorte[] => []

export type BuscaDoRecorte = {
  competicao?: number
  temporada?: number
  contexto?: Schemas['ContextoDeRecorteDto']
}

export const rotuloDoRecorte = (_recorte: Recorte, _lista: Recorte[]): string => ''

export const validarBuscaDoRecorte = (_busca: Record<string, unknown>): BuscaDoRecorte => ({})

export const encontrarRecorte = (_lista: Recorte[], _busca: BuscaDoRecorte): Recorte | undefined =>
  undefined

export const recorteParaBusca = (_recorte: Recorte): Required<BuscaDoRecorte> => ({
  competicao: 0,
  temporada: 0,
  contexto: 'Clube',
})

export const recorteParaParams = (_recorte: Recorte) => ({
  CompeticaoId: 0,
  TemporadaId: 0,
  Contexto: 'Clube' as Schemas['ContextoDeRecorteDto'],
})
