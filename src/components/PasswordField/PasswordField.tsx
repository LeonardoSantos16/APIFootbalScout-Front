import { useState } from 'react'
import { TextField, type TextFieldProps } from '../TextField/TextField'
import styles from './PasswordField.module.css'

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>

export const PasswordField = (props: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className={styles.toggle}
          disabled={props.disabled}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      }
    />
  )
}
