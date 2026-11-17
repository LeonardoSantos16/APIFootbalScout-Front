import { describe, expect, it } from 'vitest'
import { isDeleteConfirmed, validatePasswordChange, validateSignIn, validateSignUp } from './accountValidation'

const VALID_EMAIL = 'ana.ribeiro@exemplo.com'

describe('validateSignIn', () => {
  it('aceita e-mail e senha preenchidos', () => {
    // Act
    const errors = validateSignIn({ email: VALID_EMAIL, password: 'qualquer' })

    // Assert
    expect(errors).toEqual({})
  })

  it.each([
    ['sem @', 'ana.ribeiro'],
    ['vazio', ''],
    ['com mais de 254 caracteres', `${'a'.repeat(250)}@exemplo.com`],
  ])('recusa e-mail %s', (_case, email) => {
    // Act
    const errors = validateSignIn({ email, password: 'qualquer' })

    // Assert
    expect(errors.email).toBe('Informe um e-mail válido.')
  })

  it('pede a senha vazia', () => {
    // Act
    const errors = validateSignIn({ email: VALID_EMAIL, password: '' })

    // Assert
    expect(errors).toEqual({ password: 'Informe a senha.' })
  })
})

describe('validateSignUp', () => {
  it('aceita os limites do contrato', () => {
    // Act
    const errors = validateSignUp({ name: 'Al', email: VALID_EMAIL, password: 'a'.repeat(72) })

    // Assert
    expect(errors).toEqual({})
  })

  it.each([
    ['curto', 'A'],
    ['so com espacos', '   '],
    ['longo', 'a'.repeat(121)],
  ])('recusa nome %s', (_case, name) => {
    // Act
    const errors = validateSignUp({ name, email: VALID_EMAIL, password: 'senhaboa123' })

    // Assert
    expect(errors.name).toBe('O nome precisa ter de 2 a 120 caracteres.')
  })

  it.each([
    ['curta', '1234'],
    ['longa', 'a'.repeat(73)],
  ])('recusa senha %s', (_case, password) => {
    // Act
    const errors = validateSignUp({ name: 'Ana Ribeiro', email: VALID_EMAIL, password })

    // Assert
    expect(errors.password).toBe('A senha precisa ter de 8 a 72 caracteres.')
  })

  it('valida o e-mail como na entrada', () => {
    // Act
    const errors = validateSignUp({ name: 'Ana Ribeiro', email: 'ana.ribeiro', password: 'senhaboa123' })

    // Assert
    expect(errors).toEqual({ email: 'Informe um e-mail válido.' })
  })
})

describe('validatePasswordChange', () => {
  it('aceita a troca completa', () => {
    // Act
    const errors = validatePasswordChange({
      currentPassword: 'senhaboa123',
      newPassword: 'novasenha1',
      confirmation: 'novasenha1',
    })

    // Assert
    expect(errors).toEqual({})
  })

  it('pede a senha atual', () => {
    // Act
    const errors = validatePasswordChange({ currentPassword: '', newPassword: 'novasenha1', confirmation: 'novasenha1' })

    // Assert
    expect(errors).toEqual({ currentPassword: 'Informe a senha atual.' })
  })

  it('recusa nova senha fora dos limites', () => {
    // Act
    const errors = validatePasswordChange({ currentPassword: 'senhaboa123', newPassword: '1234', confirmation: '1234' })

    // Assert
    expect(errors).toEqual({ newPassword: 'A senha precisa ter de 8 a 72 caracteres.' })
  })

  it('recusa confirmacao diferente', () => {
    // Act
    const errors = validatePasswordChange({
      currentPassword: 'senhaboa123',
      newPassword: 'novasenha1',
      confirmation: 'novasenha2',
    })

    // Assert
    expect(errors).toEqual({ confirmation: 'As senhas não conferem.' })
  })
})

describe('isDeleteConfirmed', () => {
  it.each([
    [VALID_EMAIL, true],
    ['  Ana.Ribeiro@Exemplo.com ', true],
    ['ana.ribeiro@', false],
    ['', false],
  ])('com "%s" digitado confirma: %s', (typed, expected) => {
    // Act
    const confirmed = isDeleteConfirmed(typed, VALID_EMAIL)

    // Assert
    expect(confirmed).toBe(expected)
  })
})
