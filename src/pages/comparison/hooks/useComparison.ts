import { $api } from '../../../api/client'
import type { Slice } from '../../../interfaces/slice'
import type { ComparisonPlayers, ComparisonResponse } from '../interfaces/comparison'
import { buildComparison } from '../utils/comparison'

const COMPARISON_LIFETIME_MS = 5 * 60 * 1000

const toResult = (players: ComparisonPlayers) => (response: ComparisonResponse) => ({
  response,
  table: response.resultado === 'Realizada' ? buildComparison(response, players) : undefined,
})

export const useComparison = (pageId: number, otherId: number | undefined, slice: Slice | undefined) =>
  $api.useQuery(
    'get',
    '/api/Analise/comparacao',
    {
      params: {
        query: {
          JogadorA: pageId,
          JogadorB: otherId,
          CompeticaoId: slice?.competitionId,
          TemporadaId: slice?.seasonId,
          Contexto: slice?.context,
        },
      },
    },
    {
      enabled: Boolean(slice && otherId),
      staleTime: COMPARISON_LIFETIME_MS,
      select: toResult({ pageId, otherId: otherId ?? 0 }),
    },
  )
