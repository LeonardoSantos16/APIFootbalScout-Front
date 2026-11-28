import { type ReactNode } from 'react'
import { $api } from '../../api/client'
import { saveSession } from '../../api/session'
import { Button } from '../../components/Button/Button'
import { InlineError } from '../../components/InlineError/InlineError'
import { Notice } from '../../components/Notice/Notice'
import { PasswordField } from '../../components/PasswordField/PasswordField'
import { TextField } from '../../components/TextField/TextField'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFormSubmit } from '../../hooks/useFormSubmit'
import type { SessionNotice } from '../../interfaces/session'
import { documentTitle } from '../../utils/documentTitle'
import styles from '../../styles/accountForm.module.css'
import { noticeText } from '../../utils/accountErrors'
import { validateSignIn } from '../../utils/accountValidation'

const PAGE_TITLE = 'Entrar'

interface SignInPageProps {
  notice?: SessionNotice
  onSignedIn: () => void
  signUpLink: ReactNode
}

export const SignInPage = ({ notice, onSignedIn, signUpLink }: SignInPageProps) => {
  const signIn = $api.useMutation('post', '/api/Auth/signin')
  const form = useFormSubmit({
    initialValues: { email: '', password: '' },
    validate: validateSignIn,
    onSubmit: (values) =>
      signIn.mutate(
        { body: { email: values.email.trim(), password: values.password } },
        {
          onSuccess: (auth) => {
            saveSession(auth)
            onSignedIn()
          },
          onError: form.fail,
        },
      ),
  })
  const sending = signIn.isPending

  useDocumentTitle(documentTitle(PAGE_TITLE))

  return (
    <>
      <h1 className={styles.title}>{PAGE_TITLE}</h1>
      {notice && <Notice>{noticeText(notice)}</Notice>}
      <form className={styles.form} noValidate onSubmit={form.handleSubmit}>
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
          autoComplete="current-password"
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          error={form.errors.password}
          disabled={sending}
        />
        {form.formError && (
          <InlineError message={form.formError.message} onRetry={form.formError.canRetry ? form.retry : undefined} />
        )}
        <Button type="submit" variant="primary" className={styles.submit} disabled={sending}>
          {sending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <p className={styles.alternative}>Ainda não tem conta? {signUpLink}</p>
    </>
  )
}
