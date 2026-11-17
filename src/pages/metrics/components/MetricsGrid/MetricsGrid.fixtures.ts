import type { Attribute, MetricsPer90 } from '../../interfaces/metrics'
import { ATTRIBUTE_ORDER } from '../../utils/metrics'

export const metricsResponse = (attributes: Attribute[]): MetricsPer90 => ({
  jogadorId: 1001,
  recorte: { competicaoId: 325, temporadaId: 72034, contexto: 'Clube' },
  atributos: attributes,
})

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
