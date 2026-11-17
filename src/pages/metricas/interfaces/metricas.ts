import type { components } from '../../../api/schema'

type Schemas = components['schemas']

export type MetricasPor90 = Schemas['MetricasPor90ResponseDto']

export type Atributo = Schemas['AtributoDto']

export type TipoDeAtributo = Schemas['TipoDeAtributoDto']

export interface LinhaDeMetrica {
  tipo: TipoDeAtributo
  rotulo: string
  recusada: boolean
  texto: string
  amostra?: string
}
