import { Button } from '../../../../components/Button/Button'
import { InlineError } from '../../../../components/InlineError/InlineError'
import { Notice } from '../../../../components/Notice/Notice'
import type { ChecklistItem, WriteFailure } from '../../interfaces/report'
import { FinishChecklist } from '../FinishChecklist/FinishChecklist'
import styles from './ReportActions.module.css'

const CONFLICT_MESSAGE = 'Este relatório foi alterado em outra aba.'
const RELOAD_LABEL = 'Carregar a versão atual'
const UNSAVED = 'Alterações não salvas'

export type PendingAction = 'saving' | 'finalizing'

interface ReportActionsProps {
  checklist: ChecklistItem[]
  canFinalize: boolean
  dirty: boolean
  pending?: PendingAction
  conflict?: boolean
  failure?: WriteFailure
  onSave: () => void
  onFinalize: () => void
  onReload: () => void
}

export const ReportActions = ({
  checklist,
  canFinalize,
  dirty,
  pending,
  conflict,
  failure,
  onSave,
  onFinalize,
  onReload,
}: ReportActionsProps) => {
  const locked = pending !== undefined || conflict

  return (
    <div className={styles.actions}>
      <FinishChecklist items={checklist} />
      {failure?.placement === 'notice' && <Notice>{failure.message}</Notice>}
      {conflict && <InlineError message={CONFLICT_MESSAGE} onRetry={onReload} actionLabel={RELOAD_LABEL} />}
      {!conflict && failure?.placement === 'buttons' && <InlineError message={failure.message} />}
      {dirty && <p className={styles.unsaved}>{UNSAVED}</p>}
      <div className={styles.buttons}>
        <Button onClick={onSave} disabled={locked}>
          {pending === 'saving' ? 'Salvando…' : 'Salvar rascunho'}
        </Button>
        <Button variant="primary" onClick={onFinalize} disabled={locked || !canFinalize}>
          {pending === 'finalizing' ? 'Finalizando…' : 'Finalizar relatório'}
        </Button>
      </div>
    </div>
  )
}
