import type { PlayerProfile } from '../../../interfaces/player'
import { positionFromLetter } from '../../../utils/player'
import { profileFailure } from './shortlistError'

export interface ProfileState {
  data?: PlayerProfile
  error: unknown
  isError: boolean
  isFetching: boolean
}

export interface TargetProfileView {
  fallbackName: string
  name?: string
  detail?: string
  photo?: string | null
  loading: boolean
  error?: string
  canRetry: boolean
}

export const fallbackName = (playerId: number): string => `Jogador #${playerId}`

export const targetProfileView = (playerId: number, profile?: ProfileState): TargetProfileView => {
  const base = { fallbackName: fallbackName(playerId), loading: false, canRetry: false }
  if (profile?.isError && !profile.isFetching) {
    const failure = profileFailure(profile.error)
    return { ...base, error: failure.message, canRetry: failure.canRetry }
  }
  if (!profile?.data) return { ...base, loading: true }
  const details = profile.data.details
  return {
    ...base,
    name: details?.name,
    detail: [positionFromLetter(details?.position), details?.team?.name].filter(Boolean).join(', ') || undefined,
    photo: profile.data.playerImage,
  }
}
