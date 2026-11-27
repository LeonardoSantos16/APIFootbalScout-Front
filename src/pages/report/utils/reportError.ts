import type { WriteFailure } from '../interfaces/report'

export const isConflict = (_error: unknown): boolean => false

export const isAlreadyFinalized = (_error: unknown): boolean => false

export const describeWriteError = (_error: unknown): WriteFailure => ({ message: '', placement: 'buttons' })
