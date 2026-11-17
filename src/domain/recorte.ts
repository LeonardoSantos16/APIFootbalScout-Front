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
