import type { ButtonHTMLAttributes } from 'react'
import { buttonClassName, type ButtonVariant } from './buttonClassName'

export type { ButtonVariant } from './buttonClassName'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = ({ variant = 'secondary', className, type = 'button', ...rest }: ButtonProps) => (
  <button type={type} className={buttonClassName(variant, className)} {...rest} />
)
