import { useQuery } from '@tanstack/react-query'
import { $api, fetchClient } from '../../../api/client'
import type { TrackingResponse, TrackingView } from '../interfaces/tracking'
import { buildMeasurements } from '../utils/measurements'
import { isNotTracked } from '../utils/trackingError'
import { windowText } from '../utils/window'

const TRACKING_LIFETIME_MS = 5 * 60 * 1000

const readingParams = (playerId: number) => ({ params: { path: { jogadorId: playerId } } })

export const trackingQueryKey = (playerId: number) =>
  $api.queryOptions('get', '/api/Acompanhamento/{jogadorId}', readingParams(playerId)).queryKey

const readTracking = async (playerId: number, signal: AbortSignal): Promise<TrackingResponse | null> => {
  try {
    const { data } = await fetchClient.GET('/api/Acompanhamento/{jogadorId}', { ...readingParams(playerId), signal })
    return data ?? null
  } catch (error) {
    if (isNotTracked(error)) return null
    throw error
  }
}

const toView = (response: TrackingResponse | null): TrackingView | null =>
  response ? { window: windowText(response.janela), measurements: buildMeasurements(response) } : null

export const useTracking = (playerId: number) =>
  useQuery({
    queryKey: trackingQueryKey(playerId),
    queryFn: ({ signal }) => readTracking(playerId, signal),
    staleTime: TRACKING_LIFETIME_MS,
    select: toView,
  })
