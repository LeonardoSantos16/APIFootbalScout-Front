import type { components } from '../../../api/schema'
import type { AttributeType } from '../../../interfaces/attribute'

export type MetricsPer90 = components['schemas']['MetricasPor90ResponseDto']

export interface MetricRow {
  type: AttributeType
  label: string
  refused: boolean
  text: string
  sample?: string
}
