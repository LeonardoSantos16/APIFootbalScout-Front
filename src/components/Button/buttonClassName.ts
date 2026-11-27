import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export const buttonClassName = (variant: ButtonVariant = 'secondary', className?: string) =>
  [styles.button, styles[variant], className].filter(Boolean).join(' ')

export const linkButtonClassName = (variant: ButtonVariant = 'secondary', className?: string) =>
  buttonClassName(variant, [styles.link, className].filter(Boolean).join(' '))
