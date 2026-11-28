import { ApiError } from '../../../api/client'
import { describeError } from '../../../api/errors'

const CONFLICT_CODE = 'shortlist.alterada_por_outra_requisicao'

const CONFLICT_TEXT = {
  page: 'Esta shortlist foi alterada em outra aba. A lista foi atualizada; refaça a mudança.',
  dialog: 'Esta shortlist foi alterada em outra aba. Confira e tente de novo.',
}

const codeOf = (error: unknown) =>
  error instanceof ApiError && typeof error.body === 'object' && error.body !== null
    ? (error.body as { code?: unknown }).code
    : undefined

export const isShortlistConflict = (error: unknown): boolean => {
  if (!(error instanceof ApiError) || error.status !== 412) return false
  const code = codeOf(error)
  return code === undefined || code === CONFLICT_CODE
}

export const conflictText = (place: 'page' | 'dialog'): string => CONFLICT_TEXT[place]

export const writeErrorText = (error: unknown, place: 'page' | 'dialog'): string =>
  isShortlistConflict(error) ? conflictText(place) : describeError(error).message

const PROFILE_NOT_FOUND = 'Perfil não encontrado.'

export const profileFailure = (error: unknown): { message: string; canRetry: boolean } => {
  if (error instanceof ApiError && error.status === 404) return { message: PROFILE_NOT_FOUND, canRetry: false }
  return describeError(error, { plainText: true })
}
