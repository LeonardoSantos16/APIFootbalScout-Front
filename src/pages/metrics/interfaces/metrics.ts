import type { components } from '../../../api/schema'

type Schemas = components['schemas']

export type MetricsPer90 = Schemas['MetricasPor90ResponseDto']

export type Attribute = Schemas['AtributoDto']

export type AttributeType = Schemas['TipoDeAtributoDto']

export interface MetricRow {
  type: AttributeType
  label: string
  refused: boolean
  text: string
  sample?: string
}
