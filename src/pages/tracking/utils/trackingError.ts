import { ApiError } from '../../../api/client'
import { describeError, type DescribedError } from '../../../api/errors'
import type { OpeningFailure } from '../interfaces/tracking'

const NOT_TRACKED_CODE = 'acompanhamento.dossie_nao_encontrado'
const ALREADY_TRACKED_CODE = 'acompanhamento.jogador_ja_acompanhado'
const BELOW_BUTTON_CODES = new Set(['acompanhamento.limite_atingido', 'jogador.informacoes_insuficientes'])

const READING_SOURCE_DOWN = 'Não foi possível ler o acompanhamento agora.'
const OPENING_SOURCE_DOWN = 'Não foi possível acompanhar agora.'

const codeOf = (error: unknown) =>
  error instanceof ApiError && typeof error.body === 'object' && error.body !== null
    ? (error.body as { code?: unknown }).code
    : undefined

const isSourceDown = (error: unknown) => error instanceof ApiError && error.status === 502

export const isNotTracked = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404 && codeOf(error) === NOT_TRACKED_CODE

export const isAlreadyTracked = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 409 && codeOf(error) === ALREADY_TRACKED_CODE

export const describeReadingError = (error: unknown): DescribedError =>
  isSourceDown(error) ? { message: READING_SOURCE_DOWN, canRetry: true } : describeError(error)

export const describeOpeningError = (error: unknown): OpeningFailure => {
  if (isSourceDown(error)) return { message: OPENING_SOURCE_DOWN, canRetry: true, placement: 'replace' }
  const code = codeOf(error)
  const placement = typeof code === 'string' && BELOW_BUTTON_CODES.has(code) ? 'below' : 'replace'
  return { ...describeError(error), placement }
}
