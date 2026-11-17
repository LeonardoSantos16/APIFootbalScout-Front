import { describe, expect, it } from 'vitest'
import { fieldForCode, noticeForCode, noticeText, parseNotice } from './accountErrors'

describe('fieldForCode', () => {
  it.each([
    ['usuario.email_ja_cadastrado', 'email'],
    ['usuario.credenciais_invalidas', 'password'],
    ['usuario.senha_atual_invalida', 'currentPassword'],
    ['usuario.senha_igual_a_atual', 'newPassword'],
  ])('leva %s para o campo %s', (code, field) => {
    // Act
    const result = fieldForCode(code)

    // Assert
    expect(result).toBe(field)
  })

  it.each([['usuario.nao_encontrado'], [undefined], [42]])('deixa %s sem campo', (code) => {
    // Act
    const result = fieldForCode(code)

    // Assert
    expect(result).toBeUndefined()
  })
})

describe('parseNotice', () => {
  it.each([['sessao-expirada'], ['sessao-invalida'], ['conta-excluida']])('aceita %s', (value) => {
    // Act
    const notice = parseNotice(value)

    // Assert
    expect(notice).toBe(value)
  })

  it.each([['outro'], [''], [undefined], [1]])('descarta %s', (value) => {
    // Act
    const notice = parseNotice(value)

    // Assert
    expect(notice).toBeUndefined()
  })
})

describe('noticeForCode', () => {
  it.each([
    ['usuario.token_sem_identificacao', 'sessao-invalida'],
    ['usuario.refresh_token_invalido', 'sessao-expirada'],
    [undefined, 'sessao-expirada'],
  ])('leva o code %s ao aviso %s', (code, notice) => {
    // Act
    const result = noticeForCode(code)

    // Assert
    expect(result).toBe(notice)
  })
})

describe('noticeText', () => {
  it.each([
    ['sessao-expirada', 'Sua sessão expirou. Entre novamente.'],
    ['sessao-invalida', 'Sessão inválida. Entre novamente.'],
    ['conta-excluida', 'Conta excluída.'],
  ] as const)('escreve o aviso %s', (notice, text) => {
    // Act
    const result = noticeText(notice)

    // Assert
    expect(result).toBe(text)
  })
})
