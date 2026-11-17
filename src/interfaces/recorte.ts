import type { components } from '../api/schema'

export type Contexto = components['schemas']['ContextoDeRecorteDto']

export interface Recorte {
  competicaoId: number
  temporadaId: number
  contexto: Contexto
  competicao: string
  temporada: string
  minutosJogados: number
}

export interface BuscaDoRecorte {
  competicao?: number
  temporada?: number
  contexto?: Contexto
}
