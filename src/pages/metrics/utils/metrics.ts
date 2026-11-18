import { formatMinutes } from '../../../utils/number'
import type { Attribute } from '../../../interfaces/attribute'
import {
  ATTRIBUTE_LABEL,
  ATTRIBUTE_ORDER,
  IncompleteResponseError,
  MINIMUM_SAMPLE_TEXT,
  commonSample,
  formatAttributeValue,
  refusalText,
} from '../../../utils/attributes'
import type { MetricRow, MetricsPer90 } from '../interfaces/metrics'

const MINIMUM_RULE = `Contagens por 90 minutos; métricas com menos de ${MINIMUM_SAMPLE_TEXT} ficam sem valor.`

export const footerText = (sample?: number): string =>
  sample == null ? MINIMUM_RULE : `Amostra: ${formatMinutes(sample)} jogados. ${MINIMUM_RULE}`

const buildRow = (attribute: Attribute, sharedSample: number | undefined): MetricRow => {
  const type = attribute.tipo
  const label = ATTRIBUTE_LABEL[type]

  if (attribute.resultado === 'Recusada') {
    return { type, label, refused: true, text: refusalText(attribute) }
  }

  if (attribute.valor == null) throw new IncompleteResponseError(type)

  const ownSample = attribute.amostraEmMinutos
  const sample =
    ownSample != null && ownSample !== sharedSample ? `${formatMinutes(ownSample)} jogados` : undefined

  return { type, label, refused: false, text: formatAttributeValue(type, attribute.valor), sample }
}

export const buildRows = (response: MetricsPer90): MetricRow[] => {
  const sharedSample = commonSample(response.atributos)

  return ATTRIBUTE_ORDER.map((type) => {
    const attribute = response.atributos.find((item) => item.tipo === type)
    if (!attribute) throw new IncompleteResponseError(type)
    return buildRow(attribute, sharedSample)
  })
}
