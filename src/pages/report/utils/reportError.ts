import { ApiError } from '../../../api/client'
import { describeError } from '../../../api/errors'
import type { WriteFailure } from '../interfaces/report'

const CONFLICT_CODE = 'relatorio.alterado_por_outra_requisicao'
const ALREADY_FINALIZED_CODE = 'relatorio.ja_finalizado'
const NOTICE_CODES = new Set([
  'relatorio.conclusao_ausente',
  'relatorio.conteudo_minimo_nao_atendido',
  'relatorio.observacao_futura',
])

const CONFLICT_MESSAGE = 'Este relatório foi alterado em outra aba.'
const ALREADY_FINALIZED_MESSAGE = 'Este relatório já foi finalizado.'

const codeOf = (error: unknown) =>
  error instanceof ApiError && typeof error.body === 'object' && error.body !== null
    ? (error.body as { code?: unknown }).code
    : undefined

export const isConflict = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 412 && codeOf(error) === CONFLICT_CODE

export const isAlreadyFinalized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 409 && codeOf(error) === ALREADY_FINALIZED_CODE

export const describeWriteError = (error: unknown): WriteFailure => {
  if (isConflict(error)) return { message: CONFLICT_MESSAGE, placement: 'buttons' }
  if (isAlreadyFinalized(error)) return { message: ALREADY_FINALIZED_MESSAGE, placement: 'notice' }
  const code = codeOf(error)
  const placement = typeof code === 'string' && NOTICE_CODES.has(code) ? 'notice' : 'buttons'
  return { message: describeError(error).message, placement }
}
