import { useState } from 'react'
import { $api } from '../../../api/client'
import { saveSession } from '../../../api/session'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { InlineError } from '../../../components/InlineError/InlineError'
import { Notice } from '../../../components/Notice/Notice'
import { PasswordField } from '../../../components/PasswordField/PasswordField'
import { useFormSubmit } from '../../../hooks/useFormSubmit'
import { PASSWORD_HINT, validatePasswordChange } from '../../../utils/accountValidation'
import styles from '../AccountPage.module.css'

export const PASSWORD_CHANGED = 'Senha alterada. As outras sessões encerram em até 15 minutos.'

export const ChangePasswordCard = () => {
  const changePassword = $api.useMutation('post', '/api/Auth/change-password')
  const [changed, setChanged] = useState(false)
  const form = useFormSubmit({
    initialValues: { currentPassword: '', newPassword: '', confirmation: '' },
    validate: validatePasswordChange,
    onSubmit: ({ currentPassword, newPassword }) => {
      setChanged(false)
      changePassword.mutate(
        { body: { currentPassword, newPassword } },
        {
          onSuccess: (auth) => {
            saveSession(auth)
            form.reset()
            setChanged(true)
          },
          onError: form.fail,
        },
      )
    },
  })
  const sending = changePassword.isPending

  return (
    <Card title="Alterar senha">
      <form className={styles.form} noValidate onSubmit={form.handleSubmit}>
        {changed && <Notice>{PASSWORD_CHANGED}</Notice>}
        <PasswordField
          label="Senha atual"
          autoComplete="current-password"
          value={form.values.currentPassword}
          onChange={(event) => form.setField('currentPassword', event.target.value)}
          error={form.errors.currentPassword}
          disabled={sending}
        />
        <PasswordField
          label="Nova senha"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          value={form.values.newPassword}
          onChange={(event) => form.setField('newPassword', event.target.value)}
          error={form.errors.newPassword}
          disabled={sending}
        />
        <PasswordField
          label="Confirme a nova senha"
          autoComplete="new-password"
          value={form.values.confirmation}
          onChange={(event) => form.setField('confirmation', event.target.value)}
          error={form.errors.confirmation}
          disabled={sending}
        />
        {form.formError && (
          <InlineError message={form.formError.message} onRetry={form.formError.canRetry ? form.retry : undefined} />
        )}
        <div>
          <Button type="submit" variant="primary" className={styles.action} disabled={sending}>
            {sending ? 'Alterando senha…' : 'Alterar senha'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
