import { $api } from '../../../api/client'
import type { Slice } from '../../../interfaces/slice'
import { sliceToQuery } from '../../../utils/slice'
import type { MetricsPer90 } from '../interfaces/metrics'
import { commonSample } from '../../../utils/attributes'
import { buildRows, footerText } from '../utils/metrics'

const toGrid = (response: MetricsPer90) => ({
  rows: buildRows(response),
  footnote: footerText(commonSample(response.atributos)),
})

export const useMetricsPer90 = (playerId: number, slice: Slice | undefined) =>
  $api.useQuery(
    'get',
    '/api/Analise/{jogadorId}/metricas-por-90',
    {
      params: {
        path: { jogadorId: playerId },
        query: slice ? sliceToQuery(slice) : undefined,
      },
    },
    { enabled: Boolean(slice), select: toGrid },
  )
