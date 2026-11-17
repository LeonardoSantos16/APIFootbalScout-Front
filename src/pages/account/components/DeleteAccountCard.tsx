import { useState } from 'react'
import { $api } from '../../../api/client'
import { describeError } from '../../../api/errors'
import { clearSession } from '../../../api/session'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { Dialog } from '../../../components/Dialog/Dialog'
import { InlineError } from '../../../components/InlineError/InlineError'
import { TextField } from '../../../components/TextField/TextField'
import { isDeleteConfirmed } from '../../../utils/accountValidation'
import styles from '../AccountPage.module.css'

interface DeleteAccountCardProps {
  email: string
  onDeleted: () => void
}

export const DeleteAccountCard = ({ email, onDeleted }: DeleteAccountCardProps) => {
  const deleteAccount = $api.useMutation('delete', '/api/Auth/me')
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const sending = deleteAccount.isPending
  const error = deleteAccount.error ? describeError(deleteAccount.error) : undefined

  const close = () => {
    if (sending) return
    setOpen(false)
    setTyped('')
    deleteAccount.reset()
  }

  const confirm = () =>
    deleteAccount.mutate(
      {},
      {
        onSuccess: () => {
          clearSession()
          onDeleted()
        },
      },
    )

  return (
    <Card title="Excluir conta">
      <div className={styles.section}>
        <p className={styles.text}>Apaga a conta com seus relatórios, shortlists e acompanhamentos. Não dá para desfazer.</p>
        <div>
          <Button className={styles.action} onClick={() => setOpen(true)}>
            Excluir conta
          </Button>
        </div>
      </div>
      <Dialog
        open={open}
        title="Excluir conta"
        description="A conta será apagada com seus relatórios, shortlists e acompanhamentos. Não dá para desfazer."
        onClose={close}
        actions={
          <>
            <Button onClick={close} disabled={sending}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirm} disabled={sending || !isDeleteConfirmed(typed, email)}>
              {sending ? 'Excluindo conta…' : 'Excluir conta'}
            </Button>
          </>
        }
      >
        <TextField
          label={`Digite ${email} para confirmar`}
          type="email"
          autoComplete="off"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          disabled={sending}
        />
        {error && <InlineError message={error.message} onRetry={error.canRetry ? confirm : undefined} />}
      </Dialog>
    </Card>
  )
}
