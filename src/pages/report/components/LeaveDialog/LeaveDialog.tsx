import { Button } from '../../../../components/Button/Button'
import { Dialog } from '../../../../components/Dialog/Dialog'

interface LeaveDialogProps {
  open: boolean
  onLeave: () => void
  onStay: () => void
}

export const LeaveDialog = ({ open, onLeave, onStay }: LeaveDialogProps) => (
  <Dialog
    open={open}
    title="Sair sem salvar?"
    description="As alterações deste relatório serão perdidas."
    onClose={onStay}
    actions={
      <>
        <Button onClick={onLeave}>Sair</Button>
        <Button variant="primary" onClick={onStay}>
          Continuar editando
        </Button>
      </>
    }
  />
)
