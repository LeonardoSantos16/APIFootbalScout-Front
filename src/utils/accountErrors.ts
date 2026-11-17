import type { SessionNotice } from '../interfaces/session'

export type AccountField = 'email' | 'password' | 'currentPassword' | 'newPassword'

export const fieldForCode = (_code: unknown): AccountField | undefined => {
  throw new Error('não implementado')
}

export const parseNotice = (_value: unknown): SessionNotice | undefined => {
  throw new Error('não implementado')
}

export const noticeForCode = (_code: unknown): SessionNotice => {
  throw new Error('não implementado')
}

export const noticeText = (_notice: SessionNotice): string => {
  throw new Error('não implementado')
}
