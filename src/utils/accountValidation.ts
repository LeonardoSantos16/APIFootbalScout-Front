import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../config/account'

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>

export interface SignInValues {
  email: string
  password: string
}

export interface SignUpValues {
  name: string
  email: string
  password: string
}

export interface PasswordChangeValues {
  currentPassword: string
  newPassword: string
  confirmation: string
}

export const PASSWORD_HINT = `De ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres.`

const INVALID_EMAIL = 'Informe um e-mail válido.'
const INVALID_NAME = `O nome precisa ter de ${NAME_MIN_LENGTH} a ${NAME_MAX_LENGTH} caracteres.`
const INVALID_PASSWORD = `A senha precisa ter de ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres.`

const withinLength = (value: string, min: number, max: number) => value.length >= min && value.length <= max

const isEmail = (value: string) => {
  const email = value.trim()
  return email.includes('@') && email.length <= EMAIL_MAX_LENGTH
}

const isPassword = (value: string) => withinLength(value, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)

const compact = <Field extends string>(errors: Record<Field, string | false>): FieldErrors<Field> =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as FieldErrors<Field>

export const validateSignIn = ({ email, password }: SignInValues): FieldErrors<keyof SignInValues> =>
  compact({
    email: !isEmail(email) && INVALID_EMAIL,
    password: password.length === 0 && 'Informe a senha.',
  })

export const validateSignUp = ({ name, email, password }: SignUpValues): FieldErrors<keyof SignUpValues> =>
  compact({
    name: !withinLength(name.trim(), NAME_MIN_LENGTH, NAME_MAX_LENGTH) && INVALID_NAME,
    email: !isEmail(email) && INVALID_EMAIL,
    password: !isPassword(password) && INVALID_PASSWORD,
  })

export const validatePasswordChange = ({
  currentPassword,
  newPassword,
  confirmation,
}: PasswordChangeValues): FieldErrors<keyof PasswordChangeValues> =>
  compact({
    currentPassword: currentPassword.length === 0 && 'Informe a senha atual.',
    newPassword: !isPassword(newPassword) && INVALID_PASSWORD,
    confirmation: isPassword(newPassword) && confirmation !== newPassword && 'As senhas não conferem.',
  })

export const isDeleteConfirmed = (typed: string, email: string): boolean =>
  typed.trim().length > 0 && typed.trim().toLowerCase() === email.trim().toLowerCase()
