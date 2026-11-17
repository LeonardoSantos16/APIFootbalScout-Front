import { $api } from '../api/client'

export const usePlayerProfile = (playerId: number) =>
  $api.useQuery('get', '/api/Players/{id}/profile', { params: { path: { id: playerId } } })
