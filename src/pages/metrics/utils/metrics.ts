import { MIN_SAMPLE_MINUTES } from '../../../config/scout'
import { formatDecimal, formatMinutes, formatPercent } from '../../../utils/number'
import type { Attribute, AttributeType, MetricRow, MetricsPer90 } from '../interfaces/metrics'

export class IncompleteResponseError extends Error {
  constructor(type: AttributeType) {
    super(`Atributo ausente ou sem valor: ${type}`)
    this.name = 'IncompleteResponseError'
  }
}

export const ATTRIBUTE_ORDER: AttributeType[] = [
  'Gols',
  'Assistencias',
  'PassesDecisivos',
  'Desarmes',
  'Interceptacoes',
  'Rating',
  'PrecisaoDePasse',
]

export const ATTRIBUTE_LABEL: Record<AttributeType, string> = {
  Gols: 'Gols, por 90',
  Assistencias: 'Assistências, por 90',
  PassesDecisivos: 'Passes decisivos, por 90',
  Desarmes: 'Desarmes, por 90',
  Interceptacoes: 'Interceptações, por 90',
  Rating: 'Nota, média',
  PrecisaoDePasse: 'Precisão de passe',
}

const formatValue = (type: AttributeType, value: number) =>
  type === 'PrecisaoDePasse' ? formatPercent(value) : formatDecimal(value, 2)

const MINIMUM = formatMinutes(MIN_SAMPLE_MINUTES)

export const refusalText = (attribute: Attribute): string => {
  if (attribute.motivo === 'FonteNaoAtribuiu') return 'Não publicado pela fonte'
  if (attribute.amostraEmMinutos == null) return `Amostra insuficiente: mínimo de ${MINIMUM}`
  const sample = formatDecimal(attribute.amostraEmMinutos, 0)
  return `Amostra insuficiente: ${sample} de ${MINIMUM}`
}

export const footerSample = (attributes: Attribute[]): number | undefined => {
  const counts = new Map<number, number>()
  for (const { amostraEmMinutos } of attributes) {
    if (amostraEmMinutos == null) continue
    counts.set(amostraEmMinutos, (counts.get(amostraEmMinutos) ?? 0) + 1)
  }
  const [mostCommon] = [...counts].sort(
    ([sampleA, countA], [sampleB, countB]) => countB - countA || sampleB - sampleA,
  )
  return mostCommon?.[0]
}

const MINIMUM_RULE = `Contagens por 90 minutos; métricas com menos de ${MINIMUM} ficam sem valor.`

export const footerText = (sample?: number): string =>
  sample == null ? MINIMUM_RULE : `Amostra: ${formatMinutes(sample)} jogados. ${MINIMUM_RULE}`

const buildRow = (attribute: Attribute, commonSample: number | undefined): MetricRow => {
  const type = attribute.tipo
  const label = ATTRIBUTE_LABEL[type]

  if (attribute.resultado === 'Recusada') {
    return { type, label, refused: true, text: refusalText(attribute) }
  }

  if (attribute.valor == null) throw new IncompleteResponseError(type)

  const ownSample = attribute.amostraEmMinutos
  const sample =
    ownSample != null && ownSample !== commonSample ? `${formatMinutes(ownSample)} jogados` : undefined

  return { type, label, refused: false, text: formatValue(type, attribute.valor), sample }
}

export const buildRows = (response: MetricsPer90): MetricRow[] => {
  const commonSample = footerSample(response.atributos)

  return ATTRIBUTE_ORDER.map((type) => {
    const attribute = response.atributos.find((item) => item.tipo === type)
    if (!attribute) throw new IncompleteResponseError(type)
    return buildRow(attribute, commonSample)
  })
}
