import type { components } from '../../api/schema'
import type { Attribute } from '../../interfaces/attribute'
import type { MetricsPer90 } from '../../pages/metrics/interfaces/metrics'
import { ATTRIBUTE_ORDER } from '../../utils/attributes'

type Recorte = components['schemas']['RecorteDto']

const DEFAULT_RECORTE: Recorte = { competicaoId: 325, temporadaId: 72034, contexto: 'Clube' }

export const metricsResponse = (
  attributes: Attribute[],
  jogadorId = 1001,
  recorte: Recorte = DEFAULT_RECORTE,
): MetricsPer90 => ({ jogadorId, recorte, atributos: attributes })

export const calculatedAttributes: Attribute[] = [
  { tipo: 'Gols', resultado: 'Calculada', valor: 0.35, amostraEmMinutos: 1284 },
  { tipo: 'Assistencias', resultado: 'Calculada', valor: 0.21, amostraEmMinutos: 1284 },
  { tipo: 'PassesDecisivos', resultado: 'Calculada', valor: 1.87, amostraEmMinutos: 1284 },
  { tipo: 'Desarmes', resultado: 'Calculada', valor: 2.1, amostraEmMinutos: 1284 },
  { tipo: 'Interceptacoes', resultado: 'Recusada', motivo: 'FonteNaoAtribuiu' },
  { tipo: 'Rating', resultado: 'Calculada', valor: 7.123, amostraEmMinutos: 1284 },
  { tipo: 'PrecisaoDePasse', resultado: 'Calculada', valor: 86.43, amostraEmMinutos: 1190 },
]

export const insufficientSampleAttributes: Attribute[] = ATTRIBUTE_ORDER.map((type) => ({
  tipo: type,
  resultado: 'Recusada',
  motivo: 'AmostraInsuficiente',
  amostraEmMinutos: 312,
}))

export const incompleteAttributes: Attribute[] = calculatedAttributes.filter((a) => a.tipo !== 'Desarmes')
