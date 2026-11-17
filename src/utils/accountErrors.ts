import type { SessionNotice } from '../interfaces/session'

export type AccountField = 'email' | 'password' | 'currentPassword' | 'newPassword'

const FIELD_BY_CODE: Record<string, AccountField> = {
  'usuario.email_ja_cadastrado': 'email',
  'usuario.credenciais_invalidas': 'password',
  'usuario.senha_atual_invalida': 'currentPassword',
  'usuario.senha_igual_a_atual': 'newPassword',
}

const NOTICE_TEXT: Record<SessionNotice, string> = {
  'sessao-expirada': 'Sua sessão expirou. Entre novamente.',
  'sessao-invalida': 'Sessão inválida. Entre novamente.',
  'conta-excluida': 'Conta excluída.',
}

const isNotice = (value: unknown): value is SessionNotice => typeof value === 'string' && value in NOTICE_TEXT

export const fieldForCode = (code: unknown): AccountField | undefined =>
  typeof code === 'string' ? FIELD_BY_CODE[code] : undefined

export const parseNotice = (value: unknown): SessionNotice | undefined => (isNotice(value) ? value : undefined)

export const noticeForCode = (code: unknown): SessionNotice =>
  code === 'usuario.token_sem_identificacao' ? 'sessao-invalida' : 'sessao-expirada'

export const noticeText = (notice: SessionNotice): string => NOTICE_TEXT[notice]
