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

export const validateSignIn = (_values: SignInValues): FieldErrors<keyof SignInValues> => {
  throw new Error('não implementado')
}

export const validateSignUp = (_values: SignUpValues): FieldErrors<keyof SignUpValues> => {
  throw new Error('não implementado')
}

export const validatePasswordChange = (_values: PasswordChangeValues): FieldErrors<keyof PasswordChangeValues> => {
  throw new Error('não implementado')
}

export const isDeleteConfirmed = (_typed: string, _email: string): boolean => {
  throw new Error('não implementado')
}
