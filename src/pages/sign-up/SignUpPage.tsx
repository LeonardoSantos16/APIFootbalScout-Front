import { useEffect, type ReactNode } from 'react'
import { $api } from '../../api/client'
import { saveSession } from '../../api/session'
import { Button } from '../../components/Button/Button'
import { InlineError } from '../../components/InlineError/InlineError'
import { PasswordField } from '../../components/PasswordField/PasswordField'
import { TextField } from '../../components/TextField/TextField'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import styles from '../../styles/accountForm.module.css'
import { PASSWORD_HINT, validateSignUp } from '../../utils/accountValidation'

const PAGE_TITLE = 'Criar conta'

interface SignUpPageProps {
  onSignedUp: () => void
  signInLink: ReactNode
}

export const SignUpPage = ({ onSignedUp, signInLink }: SignUpPageProps) => {
  const signUp = $api.useMutation('post', '/api/Auth/signup')
  const form = useFormSubmit({
    initialValues: { name: '', email: '', password: '' },
    validate: validateSignUp,
    onSubmit: (values) =>
      signUp.mutate(
        { body: { name: values.name.trim(), email: values.email.trim(), password: values.password } },
        {
          onSuccess: (auth) => {
            saveSession(auth)
            onSignedUp()
          },
          onError: form.fail,
        },
      ),
  })
  const sending = signUp.isPending

  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  return (
    <>
      <h1 className={styles.title}>{PAGE_TITLE}</h1>
      <form className={styles.form} noValidate onSubmit={form.handleSubmit}>
        <TextField
          label="Nome"
          autoComplete="name"
          value={form.values.name}
          onChange={(event) => form.setField('name', event.target.value)}
          error={form.errors.name}
          disabled={sending}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          error={form.errors.email}
          disabled={sending}
        />
        <PasswordField
          label="Senha"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          error={form.errors.password}
          disabled={sending}
        />
        {form.formError && (
          <InlineError message={form.formError.message} onRetry={form.formError.canRetry ? form.retry : undefined} />
        )}
        <Button type="submit" variant="primary" className={styles.submit} disabled={sending}>
          {sending ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
      <p className={styles.alternative}>Já tem conta? {signInLink}</p>
    </>
  )
}
