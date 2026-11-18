import { ApiError } from '../../../api/client'
import { describeError } from '../../../api/errors'
import type { ComparisonFailure } from '../interfaces/comparison'

interface FailureContext {
  otherName?: string
  sliceText: string
}

const SOURCE_DOWN_MESSAGE = 'Não foi possível comparar agora.'
const CHOSEN_PLAYER = 'O jogador escolhido'

const codeOf = (error: ApiError) =>
  typeof error.body === 'object' && error.body !== null ? (error.body as { code?: unknown }).code : undefined

export const describeComparisonError = (error: unknown, context: FailureContext): ComparisonFailure => {
  if (error instanceof ApiError) {
    const code = codeOf(error)
    if (code === 'jogador.estatisticas_nao_encontradas') {
      const name = context.otherName ?? CHOSEN_PLAYER
      return { message: `${name} não tem estatísticas em ${context.sliceText}.`, canRetry: false, notFound: true }
    }
    if (code === 'jogador.perfil_nao_encontrado') {
      return { message: `${CHOSEN_PLAYER} não foi encontrado.`, canRetry: false, notFound: true }
    }
    if (error.status === 502) return { message: SOURCE_DOWN_MESSAGE, canRetry: true, notFound: false }
  }
  return { ...describeError(error), notFound: false }
}
