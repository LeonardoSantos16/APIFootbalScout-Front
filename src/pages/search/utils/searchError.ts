import { ApiError } from '../../../api/client'
import { describeError, type DescribedError } from '../../../api/errors'

const SOURCE_DOWN_MESSAGE = 'Não foi possível buscar agora.'

export const describeSearchError = (error: unknown): DescribedError =>
  error instanceof ApiError && error.status === 502
    ? { message: SOURCE_DOWN_MESSAGE, canRetry: true }
    : describeError(error)
