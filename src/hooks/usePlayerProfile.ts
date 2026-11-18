import { useQuery } from '@tanstack/react-query'
import { $api } from '../api/client'

const PROFILE_LIFETIME_MS = 30 * 60 * 1000

export const playerProfileQuery = (playerId: number) => ({
  ...$api.queryOptions('get', '/api/Players/{id}/profile', { params: { path: { id: playerId } } }),
  staleTime: PROFILE_LIFETIME_MS,
  gcTime: PROFILE_LIFETIME_MS,
})

export const usePlayerProfile = (playerId: number) => useQuery(playerProfileQuery(playerId))
