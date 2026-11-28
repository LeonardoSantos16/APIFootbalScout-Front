import { useQueries } from '@tanstack/react-query'
import { playerProfileQuery } from '../../../hooks/usePlayerProfile'
import type { TargetResponse } from '../interfaces/shortlist'

export const useTargetProfiles = (targets: TargetResponse[]) =>
  useQueries({ queries: targets.map((target) => playerProfileQuery(target.jogadorId)) })
